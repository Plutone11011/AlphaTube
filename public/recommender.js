
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
		if(data.items[index].snippet.title.includes(songOnPlayer) ||
			data.items[index].id.videoId === videoNamespace.getCurrentPlayerId())
		{
			data.items.splice(index,1);
		}
		index--;
	}
}

//Scambia visibilità
function toggleVisibility(search, firstList, button){
	if(firstList && ((localStorage.getItem('lastVideo') === null) || button)){
		//Prima volta che visita
		setListaIniziale();
		//Nascondi TUTTO tranne la lista iniziale.
		$('.horizontal-recommender, .recommender-search, .player-content').toggle(false);
		$('.recommender-lista-iniziale').toggle(true);
	}else if(search){
		//Nascondi TUTTO tranne il recommender Search.
		$('.horizontal-recommender, .recommender-lista-iniziale, .player-content').toggle(false);
		$('.recommender-search').toggle(true);
	}else{
		//Nascondi lista iniziale e recommender Search, rimetti TUTTO il resto visibile.
		$('.grid-recommender').toggle(false);
		$('.horizontal-recommender, .player-content').toggle(true);
	}
}

//Lancia una semplice query usando relatedToVideoId di YT.
function setRelated(){
	$.get('/related',{
		id: videoNamespace.getCurrentPlayerId()
	}).done((data)=>{
		data = JSON.parse(data);
		removeChannels(data);
		createListOfThumbnails(data,"Related");
		reasonsForRecommending.setRelated();
		addReasons("Related");
	})
}

//Riempe il div dei video recentemente visualizzati.
function setRecent(){
	createListOfThumbnails(videoNamespace.getRecentVideos(), "Recent");
	reasonsForRecommending.setRecent();
	addReasons("Recent");
}

//carica lista iniziale
function setListaIniziale(){
	$.get('/firstList').done(function(data){
		data = JSON.parse(data);
		var splitData = splitArray(data.map(array => array.videoID),50);
		splitData.forEach(function(value,index){
			$.get('/search',{
				q: value.join(',')
			}).done(function(data){
				data = JSON.parse(data);
				listaInizialeNamespace.add(data.items);
				if(listaInizialeNamespace.done()){
					createFlexBoxOfThumbnails(listaInizialeNamespace.get(),"FirstList");
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
		createListOfThumbnails(data,"Random");
		reasonsForRecommending.setRandom();
		addReasons("Random");
	})
}

function sparqlQueryforMusicGenre(res){
	let resource = `<http://dbpedia.org/resource/${res}>`;
	return (`PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	SELECT ?lab WHERE { ${resource} 
	dbo:genre ?genre. ?genre rdfs:label ?lab FILTER langMatches(lang(?lab),'en') }`) ;
}

//Video dello stesso channel o ricerca per artista?
function setArtistSimilarity(){
	$.get('/channel',{
		id: videoNamespace.getCurrentPlayerVideoChannelId()
		}).done((data)=>{
			data = JSON.parse(data);
			removeSameSong(data);
			removeChannels(data);
			createListOfThumbnails(data,"ArtistSimilarity");
			reasonsForRecommending.setArtistSimilarity(videoNamespace.getCurrentChannelTitle());
			addReasons("ArtistSimilarity");
		})
}


function setGenreSimilarity(){
	
	function noThumbnailFound(){
		$(".GenreSimilarity > img").attr("alt","Non è stato possibile trovare video simili per genere");
		var emptyData = {items: []};
		createListOfThumbnails(emptyData,"GenreSimilarity");
	}
	
	function getGenreResults(bindings){
		$.get("/similarity_genre",{
			genre: bindings
		}).done((data)=>{
			data = JSON.parse(data);
			//andrebbe anche controllato se nella lista ci sono video dello stesso artista
			//removeChannels(data); Forse serve?
			createListOfThumbnails(data,"GenreSimilarity");
			reasonsForRecommending.setGenreSimilarity(bindings);
			addReasons("GenreSimilarity");
		});
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


function setAbsoluteLocalPopularity(){
	$.get("/localPopularity").done((data1)=>{
		if (data1.length){
			$.get("/search",{
				q: (data1.map(a => Object.keys(a).toString())).join(',') 
			}).done((data2)=>{
				data2 = JSON.parse(data2);
				createListOfThumbnails(data2,"AbsoluteLocalPopularity");
				reasonsForRecommending.setAbsoluteLocalPopularity(data1.map(id => Object.values(id)));
				addReasonsPopularity("AbsoluteLocalPopularity");
			});
		}
	});
}

function setRelativeLocalPopularity(){
	$.get("/relativePopularity",{
		id: videoNamespace.getCurrentPlayerId()
	}).done((data1)=>{
		if(data1.length){
			$.get("/search",{
				q: (data1.map(array => array.videoId)).join(',')
			}).done((data2)=>{
				data2 = JSON.parse(data2);
				createListOfThumbnails(data2,"RelativeLocalPopularity");
				reasonsForRecommending.setRelativeLocalPopularity(data1.map(id => id["prevalentReason"]));
				addReasonsPopularity("RelativeLocalPopularity");
			})
		}else{
			console.log('Nessuna relazione');
			emptyThumbnails(false,"RelativeLocalPopularity");
		}
	})
}

//Crea local storage
function saveLocalStorage(){
	localStorage.setItem("lastVideo", JSON.stringify(videoNamespace.getCurrentPlayerVideo()));
	localStorage.setItem('lastCurrentTime', JSON.stringify(Math.round(player.getCurrentTime())));
	localStorage.setItem('recentVideos', JSON.stringify(videoNamespace.getRecentVideos()));
}

// Carica video nel player e setta i vari box.
function setVideo(data, startTime = 0){
	videoNamespace.updateWatchTime();
	timerNamespace.resetTimer();
	videoNamespace.setCurrentPlayerVideo(data)
	player.loadVideoById({
		videoId: videoNamespace.getCurrentPlayerId(),
		startSeconds: startTime,
		suggestedQuality: 'large'
	});
	if(!(historyNamespace.inHistory())){
		historyNamespace.addToHistory();
	}
	historyNamespace.setHistory(false);
	setComments();
	setRelated();
	setDescription();
	setRecent();
    setRandom();
	setAbsoluteLocalPopularity(); 
	setRelativeLocalPopularity();
}