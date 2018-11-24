
/* L'api di youtube fa schifo. Anche specificando type: "video", il furbone ritorna comunque
dei channel con struttura items[i].id.channelId inveche che items[i].id.videoId
Probabilmente per Marketing? Non lo so, non mi interessa.
Questa funzione risolve i problemi creati da youtube.
E' pesante da reiterare ad ogni nuova ricerca...
Spostare sul server? WIP.
*/
function removeChannels(data){
	var index = data.items.length - 1;
	while (index >= 0){
        if(data.items[index].id.kind == 'youtube#channel'){
        	data.items.splice(index,1);
        }
        index--;  
    }
}

// Usato per ArtistSimilarity, rimuove la canzone sul player dalla lista ArtistSimilarity.
function removeSameSong(data){
	var index = data.items.length - 1;
	var songOnPlayer = videoNamespace.getCurrentPlayerSong();
	while(index >= 0){
		if(data.items[index].snippet.title.includes(songOnPlayer)){
			data.items.splice(index,1);
		}
		index--;
	}
}

//Lancia una semplice query usando relatedToVideoId di YT.
function setRelated(){
	$.get('/related',{
		id: videoNamespace.getCurrentPlayerId()
	}).done((data)=>{
		data = JSON.parse(data);
		removeChannels(data);
		createListOfThumbnails(data,"thumbnailRelated");
	})
}

//Riempe il div dei video recentemente visualizzati.
function setRecent(){
	createListOfThumbnails(videoNamespace.getRecentVideos(), "thumbnailRecent")
}

//carica lista iniziale
function setListaIniziale(){
	$.get('/firstList').done(function(data){
		data = JSON.parse(data);
		//Quel cazzim di Youtube non accetta query con più di 50 id.
		//Il JSON iniziale ne ha 118, si, 118.
		//Lo splitto e faccio query sui sotto split.
		var splitData = splitArray(data.map((data) => data.videoID),50);
		splitData.forEach(function(value,index){
			$.get('/search',{
				q: value.join(',')
			}).done(function(data){
				data = JSON.parse(data);
				listaInizialeNamespace.add(data.items);
				if(listaInizialeNamespace.done()){
					createListOfThumbnails(listaInizialeNamespace.get(),"thumbnailFirstList");
				}
			})
		})		
	})
}

function randomDate(start, end) {
		//Math.random() returns a float number between 0 and 1
		//returns random Date between start and end
    	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Splitta array, in size.
function splitArray(array, size){
	var groups = [],i;
	for(i = 0; i < array.length; i += size){
		groups.push(array.slice(i,i + size));
	}
	return groups;
}

function setRandom(){
	var data1 = randomDate(new Date(2005, 4, 25), new Date());
	var data2 = new Date(data1);
	data2.setMonth(data1.getMonth()+1);
	$.get('/random',{
		lessRecentDate: data1.toISOString(),
		mostRecentDate: data2.toISOString(),
		//videoCategoryId: '10',
		//type:'video',
		//maxResults: 30
	}).done((data)=>{
		data = JSON.parse(data);
		removeChannels(data);
		createListOfThumbnails(data,"thumbnailRandom");
	})
}

function sparqlQueryforMusicGenre(res){
	let resource = "<http://dbpedia.org/resource/" + res + ">";
	return ("PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+ 
    " SELECT ?lab WHERE { "+ resource + 
    " dbo:genre ?genre. ?genre rdfs:label ?lab FILTER langMatches(lang(?lab),'en') }") ;
}

//Video dello stesso channel o ricerca per artista?
function setArtistSimilarity(){
	$.get('/channel',{
		id: videoNamespace.getCurrentPlayerVideoChannelId()
		}).done((data)=>{
			data = JSON.parse(data);
			removeSameSong(data);
			removeChannels(data);
			createListOfThumbnails(data,"thumbnailArtistSimilarity");
		})
}

function setGenreSimilarity(){

	function getGenreResults(bindings){
		$.get("/similarity_genre",{
			genre: bindings
		}).done((data)=>{
			data = JSON.parse(data);
			//andrebbe anche controllato se nella lista ci sono video dello stesso artista
			//removeChannels(data); Forse serve?
			createListOfThumbnails(data,"thumbnailGenreSimilarity");
		});
	}

	function noThumbnailFound(){
		$(".thumbnailGenreSimilarity > img").attr("alt","Non è stato possibile trovare video simili per genere");
	}

	artist = videoNamespace.getCurrentPlayerArtist();
	title = videoNamespace.getCurrentPlayerSong();
	if (title){	
		queriesToDBPedia(true,title,artist,sparqlQueryforMusicGenre,getGenreResults,noThumbnailFound);
	}
	else{
		noThumbnailFound();
	}
}

function setLocalPopularity(watchTime){
	console.log(watchTime);
	if (watchTime > 15000){
		$.post("/localPopularity",{
			video : videoNamespace.getCurrentPlayerId(),
			timeswatched: watchTime
		}).done((data)=>{
			console.log(data);
		});
	}
}

// Carica video nel player e setta i vari box.
function setVideo(data){
	videoNamespace.setCurrentPlayerVideo(data)
	player.loadVideoById(videoNamespace.getCurrentPlayerId(),0,'large');
	setComments();
	setRelated();
	setDescription();
	setRecent();
    setRandom();
	setArtistSimilarity(); 
}

$(document).ready(function(){
	setListaIniziale();
	//possible to search by title, artist, id, youtube title
	$('#search_bar').submit(function(e){
		e.preventDefault();//prevents the form from being submitted to the server
        var query = $('#search_bar input').val();
        //being asynchronous, there's no guarantee the first get will be executed before the second
        $.get('/search',{
        	q: query
        }).done(function(data){
			data = JSON.parse(data);
			if(data.pageInfo.totalResults == 0){
				alert('No video found for '+query);
			}else{
				removeChannels(data);
				setVideo(data.items[0]);
				if(data.pageInfo.totalResults > 1){
					data.items.shift();//remove first element in order to iterate over the remaining ones
					createListOfThumbnails(data,"thumbnailSearch");
				}
			}
		});
	});
	//Per inizializzare currentPlayerVideo con l'oggetto di youtube del video iniziale.
	$.get('/search',{
		q: 'PfYnvDL0Qcw'
	}).done(function(data){
        data = JSON.parse(data);
        videoNamespace.setCurrentPlayerVideo(data.items[0])
        //Carico i contenuti del video iniziale senza ricaricare il video stesso con setVideo.
        setComments();
        setDescription();
		setRelated();
    	setRandom();
    	setArtistSimilarity();
    });
	$("span").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		//un elemento contiene solo il suo oggetto del video.
		setVideo(data);
		//focus sul player. NON FUNZIONA!
		$(player.getIframe()).focus();
	})
});