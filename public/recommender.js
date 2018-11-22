//namespace per non avere variabili globali.
videoNamespace = (function(){

	//Timer per aggiungere video ai recent.
	var startTime, elapsedTime, interval, added;

	function startTimer(){
		if(!interval){
			startTime = Date.now();
			interval = setInterval(updateTimer, 1);
		}
	}

	function stopTimer(){
		if(interval) {
			clearInterval(interval);
			interval = null;
			console.log('Video paused, elapsedTime: ',Math.round(elapsedTime/100)/10);
		}
	}

	function resetTimer(){
		added = false;
		stopTimer();
		elapsedTime = 0;
	}

	function updateTimer(){
		var now = Date.now();
		var offset = now - startTime;
		startTime = now;
		elapsedTime = elapsedTime + offset;
		if(elapsedTime >= 15000 && !added){
			added = true;
			addToRecent();
			console.log('15 seconds elapsed, added to recent videos');
		}
	}

	function getWatchTime(){
		return elapsedTime;
	}

	//Oggetto di YT del video attualmente sul player
	var currentPlayerVideo = {};

	//NB: Oggetti di youtube che provengono da query per Id sono diversi.
	//'youtube#video' <-- query per Id, id si trova in data.items[i].id
	//'youtube#searchResult' <-- query per 'parola', Id si trova in data.items[i].id.videoId
	//setVideo effettua controllo prima di caricare qualunque video.
	//Array di oggetti di YT che sono stati sul player
	var recentVideos = {items: []};

	//Controllo tra i recenti, se il video nel player è già stato visualizzato.
	//In caso positivo lo tolgo.
	function removeIfRecent(){
		$.each(recentVideos.items, function(index, value){
        	if(currentPlayerVideo.etag == value.etag){
        		recentVideos.items.splice(index,1);
        		return false;
        	}       
    	});
	}

	//Il video è stato in play per 15secondi, viene aggiunto ai Recent.
	function addToRecent(){
		removeIfRecent();
		recentVideos.items.unshift(currentPlayerVideo);
	}

	function getRecentVideos(){
		return recentVideos;
	}

	function setCurrentPlayerVideo(video){
		currentPlayerVideo = video;
    }

    function getCurrentPlayerVideo(){
        return currentPlayerVideo ;
    }

	return{
		startTimer: startTimer,
		stopTimer: stopTimer,
		resetTimer: resetTimer,
		getWatchTime: getWatchTime,
		addToRecent: addToRecent,
		getRecentVideos: getRecentVideos,
        setCurrentPlayerVideo: setCurrentPlayerVideo,
        getCurrentPlayerVideo: getCurrentPlayerVideo
	}
})();

listaInizialeNamespace = (function(){
	var listaIniziale = {items: []};

	function add(data){
		console.log('data to add: ',data);
		listaIniziale.items.push(...data);
		console.log('lista dopo add: ',listaIniziale);
	}

	function get(){
		return listaIniziale;
	}

	function done(){
		if(listaIniziale.items.length >= 117){
			return true;
		}else{
			return false;
		}
	}

	return{
		add: add,
		get: get,
		done: done
	}
})();
/*
genereMusicale = function(){
    var genre ;

    function getGenre(){
        return genre ;
    }

    function setGenre(g){
        genre = g ;
    }
    return {
        getGenre: getGenre,
        setGenre: setGenre
    }
}();
*/

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

//Lancia una semplice query usando relatedToVideoId di YT.
function setRelated(_id){
	$.get('/related',{
		id: _id,
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

    $.get('/artist_title',{
        titolo: videoNamespace.getCurrentPlayerVideo().snippet.title
    }).done((data)=>{
		artist = data[0];
		title = data[1];
		if (title && artist){
			var res1 = title.replace(/\s/g,"_");
            var res2 = title.replace(/\s/g,"_") + "_(song)" ;
            var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)";
			$.get(buildQuery(res1,artist,sparqlQueryforMusicGenre)).done((data)=>{
				if (data["results"]["bindings"].length){
					getGenreResults(data["results"]["bindings"]);
				}
				else {
					$.get(buildQuery(res2,artist,sparqlQueryforMusicGenre)).done((data)=>{
						if (data["results"]["bindings"].length){
							getGenreResults(data["results"]["bindings"]);
						}
						else {
							$.get(buildQuery(res3,artist,sparqlQueryforMusicGenre)).done((data)=>{
								if (data["results"]["bindings"].length){
									getGenreResults(data["results"]["bindings"]);
								}
								else {
									//notificare che area similarity vuota
								}
							})
						}
					})
				}
			})
		}
		else{
			//genereMusicale.setGenre(null);
			//forse notificare che non è possibile popolare recommender?
			//o comunque ripulire area
		}

    });
}

// Carica video nel player e setta i vari box.
function setVideo(data){
	//Se il video da caricare arriva tramite query per id.
	if(data.kind == 'youtube#video'){
		player.loadVideoById(data.id,0,'large');
		setComments(data.id);
		setRelated(data.id);
	}
	//Se il video da caricare arriva tramite query search.
	else if(data.kind == 'youtube#searchResult'){
		player.loadVideoById(data.id.videoId,0,'large');
		setComments(data.id.videoId);
		setRelated(data.id.videoId);
	}else{
		//data.kind == Se esistono altri casi.
	}
	videoNamespace.setCurrentPlayerVideo(data);
	setDescription(data.snippet.description);
	setContentBrano(data.snippet.title);
	setRecent();
    setRandom();
    setGenreSimilarity();
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
        videoNamespace.setCurrentPlayerVideo(data.items[0]);
        //Carico i contenuti del video iniziale senza ricaricare il video stesso con setVideo.
        setComments(data.items[0].id);
        setDescription(data.items[0].snippet.description);
		setContentBrano(data.items[0].snippet.title);
		setRelated(data.items[0].id);
    	setRandom();
    	setGenreSimilarity();
    });
	$("span").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		//un elemento contiene solo il suo oggetto del video.
		setVideo(data);
		//focus sul player. NON FUNZIONA!
		var iframe = $("#player")[0];
		iframe.contentWindow.focus();
	})
});