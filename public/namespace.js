var videoNamespace = (function(){

	//Oggetto di YT del video attualmente sul player
    var currentPlayerVideo;
    var currentPlayerArtist ;
    var currentPlayerSong ;

    //Il recommender da dove proviene.
    var currentPlayerRecommender;

    //Oggetto di YT dell'ultimo video visto per 15secondi.
    var pastPlayerVideoId;

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
		//fuori da if perché altrimenti non considera cliccato il primo video di un nuovo utente
		updateTimesWatched();
		if(currentPlayerRecommender &&
			pastPlayerVideoId != getCurrentPlayerId())
		{
			updateRelationships();
		}
	}

	//relazione a ~ b se da sono passato a b attraverso un recommender e ho visto b per 15 sec
	function updateRelationships(){
		console.log('gonna updateRelationships')
		//post per aggiornare relazione tra past e current.
		date = new Date(Date.now());
		$.post("/relation",{
			previous: pastPlayerVideoId,
			clicked: getCurrentPlayerId(),
			recommender: currentPlayerRecommender,
			lastSelected: date
		}).done((data)=>{
			console.log('Relations Updated');
		})
	}

	//tempo reale di visione del video
	function updateWatchTime(){
		if(currentPlayerVideo){
			if (timerNamespace.getWatchTime() > 0) {
				//post per aggiornare watchtime del video
				console.log(timerNamespace.getWatchTime());
				$.post("/watchTime",{
					video: getCurrentPlayerId(),
					time: timerNamespace.getWatchTime()
				}).done((data)=>{
					console.log("watch time updated");
				});
			}
		}
	}

	//volte/click in cui è stato visto
	function updateTimesWatched(){
		date = new Date(Date.now());
		$.post("/timesWatched",{
			id: getCurrentPlayerId,
			lastWatched: date
		}).done((data)=>{
			console.log("timesWatched updated");
		});	
	}

	function setCurrentPlayerRecommender(recommender){
		currentPlayerRecommender = recommender;
	}

	function setCurrentPlayerVideo(video){
		if(currentPlayerVideo){
			pastPlayerVideoId = getCurrentPlayerId();
		}currentPlayerVideo = video;
		setCurrentPlayerArtist_Song();
    }

    //Setta l'artista e la canzone del player.
	function setCurrentPlayerArtist_Song(){
		$.get('/artist_title',{
        	title: getCurrentPlayerTitle()
    	}).done((data)=>{
			currentPlayerArtist = data[0];
			currentPlayerSong = data[1];
			setContentBrano();
			setArtistSimilarity();
            setGenreSimilarity();
            
		})
	}

	//chiamato col cookie per ripristinare i video recenti
	function setRecentVideos(videos){
		recentVideos = videos;
	}

    function getCurrentPlayerId(){
    	if(currentPlayerVideo){
    		if(currentPlayerVideo.kind == 'youtube#searchResult'){
    			return currentPlayerVideo.id.videoId;
    		}else if(currentPlayerVideo.kind == 'youtube#video'){
    			return currentPlayerVideo.id;
    		}
    	}
    }

    function getCurrentPlayerDescription(){
    	return currentPlayerVideo.snippet.description;
    }

    function getCurrentPlayerTitle(){
    	return currentPlayerVideo.snippet.title;
    }

	function getCurrentPlayerArtist(){
		return currentPlayerArtist;
	}

	function getCurrentPlayerSong(){
		return currentPlayerSong;
	}

	function getCurrentPlayerVideoChannelId(){
		return currentPlayerVideo.snippet.channelId;
	}

	function getRecentVideos(){
		return recentVideos;
	}

	function getCurrentChannelTitle(){
		return currentPlayerVideo.snippet.channelTitle ;
	}

    function getCurrentPlayerVideo(){
        return currentPlayerVideo;
    }

	return{
		addToRecent: addToRecent,
		setCurrentPlayerVideo: setCurrentPlayerVideo,
		setCurrentPlayerRecommender: setCurrentPlayerRecommender,
		setRecentVideos: setRecentVideos,
		getRecentVideos: getRecentVideos,
        getCurrentPlayerVideo: getCurrentPlayerVideo,
        getCurrentPlayerArtist: getCurrentPlayerArtist,
        getCurrentPlayerSong: getCurrentPlayerSong,
        getCurrentPlayerId: getCurrentPlayerId,
        getCurrentPlayerDescription: getCurrentPlayerDescription,
		getCurrentPlayerVideoChannelId: getCurrentPlayerVideoChannelId,
		getCurrentPlayerTitle: getCurrentPlayerTitle,
		getCurrentChannelTitle: getCurrentChannelTitle,
		updateWatchTime: updateWatchTime
	}
})();

var timerNamespace = (function(){
    var startTime, elapsedTime, interval, added;

	function startTimer(){
		if(!interval){
			startTime = Date.now();
			//chiama updatetimer ogni secondo
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
		if((elapsedTime >= 15000) && (!added)){
			added = true;
			videoNamespace.addToRecent();
			console.log('15 seconds elapsed, added to recent videos');
		}
	}

	function getWatchTime(){
		return elapsedTime;
    }

    return {
        startTimer: startTimer,
        stopTimer: stopTimer,
        resetTimer: resetTimer,
        getWatchTime: getWatchTime
    }
})();

var historyNamespace = (function(){
	var savedInHistory = false;

	//Aggiunge il video alla history.
	function addToHistory(){
		var state = "?v="+videoNamespace.getCurrentPlayerId();
		window.history.pushState(videoNamespace.getCurrentPlayerVideo(),videoNamespace.getCurrentPlayerTitle(),state);
	}

	//True or false, dipende se è nella history.
	function inHistory(){
		return savedInHistory;
	}

	//Listener decide se già in history.
	function setHistory(bool){
		savedInHistory = bool;
	}

	return{
		addToHistory, addToHistory,
		inHistory: inHistory,
		setHistory: setHistory
	}
})();

var listaInizialeNamespace = (function(){
	var listaIniziale = {items: []};

	function add(data){
		listaIniziale.items.push(...data);
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

var reasonsForRecommending = (function(){

	var reasons = {} ;

	function setSearch(input){
		reasons["Search"] = `Consigliato perché hai cercato '${input}'`;
	}

	function setRelated(){
		reasons["Related"] = `Consigliato perché collegato all'id del video che stai visualizzando`;
	}

	function setRandom(){
		reasons["Random"] = "Consigliato perché generato da un algoritmo di scelta casuale dei video" ;
	}

	function setRecent(){
		reasons["Recent"] = "Consigliato perché è un video che hai già visualizzato in passato" ;
	}

	function setGenreSimilarity(bindings){
		var arrayOfGenres = [] ;
		for (var i = 0; i < bindings.length; i++){
			arrayOfGenres.push(bindings[i]["lab"]["value"]);
		}
		var strOfGenres = arrayOfGenres.join();
		reasons["GenreSimilarity"] = `Consigliato perché affine ai seguenti generi musicali: ${strOfGenres}`;
	}

	function setArtistSimilarity(channelTitle){
		reasons["ArtistSimilarity"] = `Consigliato perché video dello stesso canale: ${channelTitle}`;
	}
	
	//array of watchTime
	function setAbsoluteLocalPopularity(arrayOfwatchTime){
		reasons["AbsoluteLocalPopularity"] = [];
		for (var i = 0; i < arrayOfwatchTime.length; i++){
			reasons["AbsoluteLocalPopularity"].push(`Consigliato perché è stato visualizzato
			 per ${arrayOfwatchTime[i]} secondi`);	
		}
	}

	function setRelativeLocalPopularity(arrayOfPrevalentReason){
		reasons["RelativeLocalPopularity"] = [];
		for (var i = 0; i < arrayOfPrevalentReason.length; i++){
			reasons["RelativeLocalPopularity"].push(`Consigliato perché è stato visualizzato
			dopo il video corrente grazie al recommender ${arrayOfPrevalentReason[i]}`);	
		}
	}

	function setAbsoluteGlobalPopularity(arrayofTimeWatched, arrayOfSites){
		reasons["AbsoluteGlobalPopularity"] = [];
		for (var i = 0; i < arrayofTimeWatched.length; i++){
			reasons["AbsoluteGlobalPopularity"].push(`Consigliato perché visualizzato ${arrayofTimeWatched[i]}
			volte dal sito ${arrayOfSites[i]}`);
		}

	}

	function getReasons(){
		return reasons ;
	}
	return{
		setSearch: setSearch,
		setRelated: setRelated,
		setRandom: setRandom,
		setRecent: setRecent,
		setArtistSimilarity: setArtistSimilarity,
		setGenreSimilarity: setGenreSimilarity,
		getReasons: getReasons,
		setAbsoluteLocalPopularity: setAbsoluteLocalPopularity,
		setRelativeLocalPopularity: setRelativeLocalPopularity,
		setAbsoluteGlobalPopularity: setAbsoluteGlobalPopularity
	}

})();