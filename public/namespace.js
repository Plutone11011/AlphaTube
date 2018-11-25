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
		if(currentPlayerRecommender && pastPlayerVideoId && (pastPlayerVideoId != getCurrentPlayerId())){
			updateRelationships();
		}
	}

	function updateRelationships(){
		console.log('gonna updateRelationships')
		//post per aggiornare relazione tra past e current.
		$.post("/relation",{
			previous: pastPlayerVideoId,
			clicked: getCurrentPlayerId(),
			recommender: currentPlayerRecommender
		}).done((data)=>{
			console.log('Relations Updated');
		})
	}

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
        	video: videoNamespace.getCurrentPlayerVideo()
    	}).done((data)=>{
			currentPlayerArtist = data[0];
			currentPlayerSong = data[1];
            setGenreSimilarity();
            setContentBrano();
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
		updateWatchTime: updateWatchTime
	}
})();

var timerNamespace = (function(){
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