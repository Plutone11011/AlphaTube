//namespace per non avere variabili globali.
videoNamespace = function(){
	//Oggetto di YT del video attualmente sul player
	let currentPlayerVideo = {};
	//NB: Oggetti di youtube che provengono da query per Id sono diversi.
	//'youtube#video' <-- query per Id, id si trova in data.items[i].id
	//'youtube#searchResult' <-- query per 'parola', Id si trova in data.items[i].id.videoId
	//setVideo effettua controllo prima di caricare qualunque video.
	//Array di oggetti di YT che sono stati sul player
	let recentVideos = {items: []};
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
		addToRecent: addToRecent,
		getRecentVideos: getRecentVideos,
        setCurrentPlayerVideo: setCurrentPlayerVideo,
        getCurrentPlayerVideo: getCurrentPlayerVideo
	}
}();

//Lancia una semplice query usando relatedToVideoId di YT.
function setRelated(_id){
	$.get('/related',{
		id: _id,
	}).done((data)=>{
		data = JSON.parse(data);
		createListOfThumbnails(data,"thumbnailRelated");
	})
}

//Riempe il div dei video recentemente visualizzati.
function setRecent(){
	createListOfThumbnails(videoNamespace.getRecentVideos(), "thumbnailRecent")
}

function randomDate(start, end) {
		//Math.random() returns a float number between 0 and 1
		//returns random Date between start and end
    	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
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
		createListOfThumbnails(data,"thumbnailRandom");
	})
}

function setSimilarity(){
    $.get('/similarity',{
        titolo: videoNamespace.getCurrentPlayerVideo().snippet.title,
        recommender: 1
    }).done((data)=>{
		console.log(data);
		//elimino titoli duplicati nel caso in cui musicbrainz abbia ritornato versioni diverse della stessa canzone
		/*var uniqueTitles = [];	
		$.each(data, function(index, el){
    		if($.inArray(el.title, uniqueTitles) === -1) {
				uniqueTitles.push(el);//cerca elemento corrente nell'array dei titoli unici, se non c'è lo aggiunge
			}
		});
		*/
		data = JSON.parse(data) ;
		createListOfThumbnails(data,"thumbnailSimilarity");
    });
}

// Carica video nel player e setta i vari box.
function setVideo(data){
	//Se il video è rimasto in play per 15secondi, lo aggiungo ai video recenti.
	if(player.getCurrentTime()>= 15){
		videoNamespace.addToRecent();
	}
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
    setSimilarity();
}

$(document).ready(function(){

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
		setRecent();
    	setRandom();
    	setSimilarity();
    });
	$("span").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		//un elemento contiene solo il suo oggetto del video.
		setVideo(data);
	})
});