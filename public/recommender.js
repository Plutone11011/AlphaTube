
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



function setAbsoluteGlobalPopularity(){
	
	//ci sarebbe anche 1822,1848,1824,1830,1850,1851,1861 ma dà errore per CORS, anche aggiungendo jsonp non va, 
	// 1849 dà 500 server error
	var arrayOfSites = [1829,1828,1838,1839,1846,1847,1831,1827,1836] ;
	var arrayOfResponses = [] ;

	function request(url) {
		// this is where we're hiding the asynchronicity,
		// away from the main code of our generator
		// `it.next(..)` is the generator's iterator-resume call
		$.ajax({
			url: url,
			success: function(data){
				iterator.next(data);
			},
			error: function(err){
				console.log(err);
			}
		});
	}

	function Max(maxtimeWatched){
		//ignora completamente i valori che non sono numeri
		if (typeof maxtimeWatched[0] === "number" ){
			var max = maxtimeWatched[0];
		}
		for (var i = 1; i < maxtimeWatched.length; i++){
			if (typeof maxtimeWatched[i] === "number"  && max < maxtimeWatched[i]){
				max = maxtimeWatched[i];
			}
		}
		return max ;
	}

	function getMostPopulars(arrayOfResponses){
		var arrayOfIds = [] ;
		var arrayOftimeWatched  ;
		var indexOfIdWithMaxTime ;
		var siti = [] ;
		$.each(arrayOfResponses,function(index,value){
				if (value["site"]){
					siti.push(value["site"]);
				}
				//corto circuito, non andrà mai a leggere length of undefined
				//servono entrambe perché alcuni non mettono recommended, altri lo mettono ma può essere vuoto
				if (value["recommended"] && value["recommended"].length){

					arrayOftimeWatched = value["recommended"].map(rec => rec["timesWatched"]);
					var max = Max(arrayOftimeWatched);

					indexOfIdWithMaxTime = value["recommended"].findIndex(function(element){
						return element["timesWatched"] === max ;
					});
					if (value["recommended"][indexOfIdWithMaxTime]["videoId"]){
						arrayOfIds.push(value["recommended"][indexOfIdWithMaxTime]["videoId"]);
					}
					else{
						arrayOfIds.push(value["recommended"][indexOfIdWithMaxTime]["videoID"]);
					}
				}
		});
		//console.log(arrayOftimeWatched);
		//console.log(arrayOfIds.join());
		$.get("/search",{
			q: arrayOfIds.join()
		}).done((data)=>{
			data = JSON.parse(data);
			//console.log(data);
			createListOfThumbnails(data,"AbsoluteGlobalPopularity");
			reasonsForRecommending.setAbsoluteGlobalPopularity(arrayOftimeWatched,siti);
			addReasonsPopularity("AbsoluteGlobalPopularity");
		});
}
	
	function *AbsoluteGenerator() {
		for(var i = 0; i < arrayOfSites.length; i++){
			var res = yield request(`http://site${arrayOfSites[i]}.tw.cs.unibo.it/globpop`);
			arrayOfResponses.push(res); 
		}
		//console.log(arrayOfResponses);
		getMostPopulars(arrayOfResponses);
		//res = yield request(`http://site1825.tw.cs.unibo.it/TW/globpop`);
		//arrayOfResponses.push(res);
	}

	var iterator = AbsoluteGenerator();
	iterator.next();
}

function setRelativeGlobalPopularity(){
	//ci sarebbe anche 1822,1829,1848,1824,1830,1850,1851,1861 ma dà errore per CORS, anche aggiungendo jsonp non va, 
	// 1849 dà 500 server error
	var arrayOfSites = [1828,1838,1839,1846,1847,1831,1827,1836,1823] ;
	var arrayOfResponses = [] ;

	function request(url) {
		// this is where we're hiding the asynchronicity,
		// away from the main code of our generator
		// `it.next(..)` is the generator's iterator-resume call
		$.ajax({
			url: url,
			success: function(data){
				iterator.next(data);
			},
			error: function(err){
				console.log(err);
				iterator.next(data);
			}
		});
	}

	function removeDuplicateId(arrayOfIdRelated){
		var index = arrayOfIdRelated.length - 1;
		while(index >= 0){
			for (var i = index - 1; i >= 0; i--) {
				if (arrayOfIdRelated[index]["videoId"] === arrayOfIdRelated[i]["videoId"]) {
					arrayOfIdRelated.splice(index,1);
					break;
				}
			}
			index--;
		}
	}

	function getMostWatched(arrayOfResponses){
		var arrayOfIdRelated = [];
		//Per ogni sito
		$.each(arrayOfResponses, function(index1, site){
			//Se raccomanda qualcosa
			if(site["recommended"]){
				//Per ogni video raccomandato
				$.each(site["recommended"], function(index2, recommendedVideo){
					//Alcuni usano videoID, FOR FUCK SAKE.
					if(recommendedVideo["videoID"] || recommendedVideo["videoId"]){
						if(recommendedVideo["videoId"]){
							arrayOfIdRelated.push({
								"videoId": recommendedVideo["videoId"],
								"timesWatched": recommendedVideo["timesWatched"],
								"prevalentReason": recommendedVideo["prevalentReason"],
								"site": site["site"]
							});
						}else{
							arrayOfIdRelated.push({
								"videoId": recommendedVideo["videoID"],
								"timesWatched": recommendedVideo["timesWatched"],
								"prevalentReason": recommendedVideo["prevalentReason"],
								"site": site["site"]
							});
						}
					}
				})
			}
		})
		//Ordino in base a timesWatched
		arrayOfIdRelated.sort((a,b) => b.timesWatched - a.timesWatched);
		//Rimuovo Id duplicati dal fondo, quindi i quelli con timesWatched minore.
		removeDuplicateId(arrayOfIdRelated);
		if(arrayOfIdRelated.length > 30){
			arrayOfIdRelated = arrayOfIdRelated.slice(0,30);
		}
		console.log('30 piu watched ',arrayOfIdRelated);
		$.get("/search",{
			q: arrayOfIdRelated.map(id => id.videoId).join(',')
		}).done(function(data){
			data = JSON.parse(data);
			console.log(data);
		})
	}

	function *RelativeGenerator() {
		for(var i = 0; i < arrayOfSites.length; i++){
			var res = yield request(`http://site${arrayOfSites[i]}.tw.cs.unibo.it/globpop?id=${videoNamespace.getCurrentPlayerId()}`);
			arrayOfResponses.push(res); 
		}
		console.log('RelativeGlobalPopularity',arrayOfResponses);
		getMostWatched(arrayOfResponses);
	}

	var iterator = RelativeGenerator();
	iterator.next();
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
	setAbsoluteGlobalPopularity();
	setRelativeGlobalPopularity();
}