
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
		$('.horizontal-recommender, #recommender-search, .player-content').toggle(false);
		$('#recommender-lista-iniziale').toggle(true);
	}else if(search){
		//Nascondi TUTTO tranne il recommender Search.
		$('.horizontal-recommender, #recommender-lista-iniziale, .player-content').toggle(false);
		$('#recommender-search').toggle(true);
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


//Video dello stesso channel o ricerca per artista?
function setArtistSimilarity(){
	$.get('/search',{
		q: videoNamespace.getCurrentPlayerArtist()
		}).done((data)=>{
			data = JSON.parse(data);
			removeSameSong(data);
			removeChannels(data);
			createListOfThumbnails(data,"ArtistSimilarity");
			reasonsForRecommending.setArtistSimilarity(videoNamespace.getCurrentPlayerArtist());
			addReasons("ArtistSimilarity");
		})
}


function setGenreSimilarity(){

	//costruisco un json di risposta di /search appendendo, ad ogni passo
	//delle iterazioni sui generi, un video ad items
	//il resto delle proprietà di youtube#searchListResponse non ci interessa
	var youtubeResults = {kind: "youtube#searchListResponse", items: []} ;
	var genres = [] ; //array di generi per le motivazioni dei thumbnail
	var flag = false ; //condizione per chiamare i thumbnail
	var artist = videoNamespace.getCurrentPlayerArtist();
	var title = videoNamespace.getCurrentPlayerSong();
	console.log(artist,title);

	function sparqlQueryforMusicGenre(res){
		let resource = `<http://dbpedia.org/resource/${res}>`;
		//label_res possono essere album, canzoni, band...
		return (`SELECT ?label_genre ?label_res WHERE { ${resource} dbo:genre ?genre.
		?res dbo:genre ?genre ;
		 rdfs:label ?label_res .
		 ?genre rdfs:label ?label_genre. 
		 FILTER (langMatches(lang(?label_res),'en') && langMatches(lang(?label_genre),'en'))}`) ;
	}

	function noThumbnailFound(){
		$(".GenreSimilarity > img").attr("alt","Non è stato possibile trovare video simili per genere");
		var emptyData = {items: []};
		createListOfThumbnails(emptyData,"GenreSimilarity");
	}
	
	//DBPediaresource può essere un URI che rappresenta una canzone o un genere musicale
	//a seconda che venga passato insieme a sparqlQueryforMusicGenre
	//o a sparqlQueryRelatedToGenre
	function buildQueryForGenre(DBPediaresource){
		var query = sparqlQueryforMusicGenre(DBPediaresource);
		//console.log(query);
		var queryUrl = "http://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";
		console.log(queryUrl);
		return queryUrl ;
	}

	function getGenreResults(relatedToGenre,genre){
		$.get("/similarity_genre",{
			q: relatedToGenre
		}).done((data)=>{
			data = JSON.parse(data);
			genres.push(genre);
			youtubeResults["items"].push(data.items[0]);
			if (genres.length >= 30 || flag){
				console.log(genres);
				createListOfThumbnails(youtubeResults,"GenreSimilarity");
				reasonsForRecommending.setGenreSimilarity(genres);
				addReasonsPopularity("GenreSimilarity");
				//o abbiamo raggiunto 30 consigliati o ce n'erano di meno
			}
		});
	}

	if (title && artist){	

		var res1 = title.replace(/\s/g,"_");
        var res2 = title.replace(/\s/g,"_") + "_(song)" ; //Query per genere si ferma qua.
		var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)"; //Con questa avrebbe successo.
		
		

		$.get(buildQueryForGenre(res1)).done((data)=>{
            if (data["results"]["bindings"].length){
				var l = data["results"]["bindings"].length ;
				//per ogni genere ottenuto
				for (var i = 0; i < data["results"]["bindings"].length; i++){
					if (i === 30){
						//elaboriamo al massimo 30 risultati correlati
						break;
					}
					let randomIndex = Math.floor(Math.random()*(l-1)); //numero random tra 0 e l-1
					getGenreResults(data["results"]["bindings"][randomIndex]["label_res"]["value"],data["results"]["bindings"][randomIndex]["label_genre"]["value"]);
					//se siamo all'ultima iterazione, set flag a true perché ci sono meno di 30 elementi correlati
					if (i === l-1){
						flag = true ;
					}
				}
            }
            else {
                $.get(buildQueryForGenre(res2)).done((data)=>{
                    if (data["results"]["bindings"].length){
						var l = data["results"]["bindings"].length ;
						//per ogni genere ottenuto
						for (var i = 0; i < data["results"]["bindings"].length; i++){
							if (i === 30){
								//elaboriamo al massimo 30 risultati correlati
								break;
							}
							let randomIndex = Math.floor(Math.random()*(l-1)); //numero random tra 0 e l-1
							getGenreResults(data["results"]["bindings"][randomIndex]["label_res"]["value"],data["results"]["bindings"][randomIndex]["label_genre"]["value"]);
							if (i === l-1){
								flag = true ;
							}
						}
                    }
                    else {
                        $.get(buildQueryForGenre(res3)).done((data)=>{
                            if (data["results"]["bindings"].length){
								var l = data["results"]["bindings"].length ;
								//per ogni genere ottenuto
								for (var i = 0; i < data["results"]["bindings"].length; i++){
									if (i === 30){
										//elaboriamo al massimo 30 risultati correlati
										break;
									}
									let randomIndex = Math.floor(Math.random()*(l-1)); //numero random tra 0 e l-1
									getGenreResults(data["results"]["bindings"][randomIndex]["label_res"]["value"],data["results"]["bindings"][randomIndex]["label_genre"]["value"]);
									if (i === l-1){
										flag = true ;
									}
								}
                            }
                            else {
                                noThumbnailFound();
                            }
                        }).fail(()=>{
                            noThumbnailFound();
                        });
                    }
                }).fail(()=>{
                    noThumbnailFound();
                });
            }
        }).fail(()=>{
            noThumbnailFound();
        });
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
	// I siti 1828,1838,1839,1846,1847,1831,1827,1823 non presentano errore CORS.
	var arrayOfSites = [1828,1838,1839,1846,1847,1831,1827,1823];
	//var arrayOfSites = [1829,1828,1838,1839,1846,1822,1847,1831,1827,1848,1824,1830,1836,1850,1849,1851,1861,1823] ;
	var arrayOfResponses = [] ;
	var proxyCORS = "https://cors-anywhere.herokuapp.com/"; //dopo troppe richieste comincia a rifiutare errore 429
	var proxyCORS2 = "https://crossorigin.me/" //spesso offline

	function request(url) {
		// this is where we're hiding the asynchronicity,
		// away from the main code of our generator
		// `it.next(..)` is the generator's iterator-resume call
		$.ajax({
			url: url, //Usare proxyCORS + url per evitare errori CORS
			success: function(data){
				iterator.next(data);
			},
			error: function(err){
				console.log(err);
				iterator.next();
			}
		});
	}


	function getMostPopulars(arrayOfResponses){
		var arrayOfIds = [] ;
		var arrayOftimeWatched  ;
		var indexOfIdWithMaxTime ;
		var siti = [] ; //da passare a reasonsForRecommending
		var arrayOfMaxtimeWatched = [] ; //da passare a reasonsForRecommending
		$.each(arrayOfResponses,function(index,value){
			if(value){
				if (value["site"]){
					siti.push(value["site"]);
				}
				//corto circuito, non andrà mai a leggere length of undefined
				//servono entrambe perché alcuni non mettono recommended, altri lo mettono ma può essere vuoto
				if (value["recommended"] && value["recommended"].length){
					arrayOftimeWatched = value["recommended"].map(rec => rec["timesWatched"]);

					var max = Math.max( ...arrayOftimeWatched );
					arrayOfMaxtimeWatched.push(max);

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
			}
		});
		//console.log(arrayOftimeWatched);
		//console.log(arrayOfIds.join());
		$.get("/search",{
			q: arrayOfIds.join()
		}).done((data)=>{
			data = JSON.parse(data);
			createListOfThumbnails(data,"AbsoluteGlobalPopularity");
			reasonsForRecommending.setAbsoluteGlobalPopularity(arrayOfMaxtimeWatched,siti);
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

function setVitali(){
	$.get("http://site1825.tw.cs.unibo.it/TW/globpop").done((data)=>{
		console.log(data);
		$.get("/search",{
			q: (data["recommended"].map(fv => fv.videoID)).join(',')
		}).done((data)=>{
			data = JSON.parse(data);
			createListOfThumbnails(data,"FVitali");
			reasonsForRecommending.setFVitali();
			addReasons("FVitali");
		}).fail(()=>{

		})
	});
}

function setRelativeGlobalPopularity(){
	// I siti 1828,1838,1839,1846,1847,1831,1827,1823 non presentano errore CORS.
	var arrayOfSites = [1829,1828,1838,1839,1846,1822,1847,1831,1827,1848,1824,1830,1836,1850,1849,1851,1861,1823] ;
	var arrayOfResponses = [] ;
	var proxyCORS = "https://cors-anywhere.herokuapp.com/"; //dopo troppe richieste comincia a rifiutare errore 429
	var proxyCORS2 = "https://crossorigin.me/" //spesso offline

	function request(url) {
		// this is where we're hiding the asynchronicity,
		// away from the main code of our generator
		// `it.next(..)` is the generator's iterator-resume call
		$.ajax({
			url: url, //Usare proxyCORS + url per evitare errori CORS
			success: function(data){
				iterator.next(data);
			},
			error: function(err){
				console.log(err);
				iterator.next();
			}
		});
	}

	function removeDuplicateId(arrayOfIdRelated){
		var index = arrayOfIdRelated.length - 1;
		/*Per ogni video, confrante il suo id con tutti gli altri.
		Parte dal fondo, se trova un id uguale toglie dal fondo,
		quindi quello con meno timesWatched essendo ordinati.
		*/
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
			if(site){
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
			}
		})
		//Ordino in base a timesWatched
		arrayOfIdRelated.sort((a,b) => b.timesWatched - a.timesWatched);
		//Rimuovo Id duplicati dal fondo, quindi i quelli con timesWatched minore.
		removeDuplicateId(arrayOfIdRelated);
		if(arrayOfIdRelated.length > 30){
			arrayOfIdRelated = arrayOfIdRelated.slice(0,30);
		}
		var arrayOfPrevalentReason = [], arrayOfSites = [], arrayOfTimeWatched = [];
		arrayOfPrevalentReason = arrayOfIdRelated.map(reason => reason.prevalentReason);
		arrayOfSites = arrayOfIdRelated.map(site => site.site);
		arrayOfTimeWatched = arrayOfIdRelated.map(timeWatched => timeWatched.timesWatched);
		$.get("/search",{
			q: arrayOfIdRelated.map(id => id.videoId).join(',')
		}).done(function(data){
			data = JSON.parse(data);
			createListOfThumbnails(data, "RelativeGlobalPopularity");
			reasonsForRecommending.setRelativeGlobalPopularity(arrayOfPrevalentReason,arrayOfSites);
			addReasonsPopularity("RelativeGlobalPopularity");
		})
	}

	function *RelativeGenerator() {
		for(var i = 0; i < arrayOfSites.length; i++){
			var res = yield request(`http://site${arrayOfSites[i]}.tw.cs.unibo.it/globpop?id=${videoNamespace.getCurrentPlayerId()}`);
			arrayOfResponses.push(res); 
		}
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
	setVitali();
	setAbsoluteLocalPopularity(); 
	setRelativeLocalPopularity();
	setAbsoluteGlobalPopularity();
	setRelativeGlobalPopularity();
}