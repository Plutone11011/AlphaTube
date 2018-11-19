//namespace per non avere variabili globali.
videoNamespace = function(){
	//Oggetto di YT del video attualmente sul player
	let currentPlayerVideo = {};
	//Array di oggetti di YT che sono stati sul player
	let recentVideos = {items: []};
	//Controllo tra i recenti, se il video nel player è già stato visualizzato. In caso positivo lo tolgo.
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
	return{
		addToRecent: addToRecent,
		getRecentVideos: getRecentVideos,
		setCurrentPlayerVideo: setCurrentPlayerVideo
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
        titolo: currentPlayerVideo.snippet.title,
        recommender: 1
    }).done((data)=>{
        console.log(data);
    });
}

// Carica video nel player e setta i vari box.
function setVideo(data){
	//Se il video è rimasto in play per 15secondi, lo aggiungo ai video recenti.
	if(player.getCurrentTime()>= 15){
		videoNamespace.addToRecent();
	}
	player.loadVideoById(data.id.videoId,0,'large');
	videoNamespace.setCurrentPlayerVideo(data);
	setRelated(data.id.videoId);
	setRecent();
	setRandom();
	setDescription(data.snippet.description);
	setComments(data.id.videoId);
	setContentBrano(data.snippet.title);

}

$(document).ready(function(){

	//possible to search by title, artist, id, youtube title
	$('#search_bar').submit(function(e){
		e.preventDefault();//prevents the form from being submitted to the server
        var query = $('#search_bar input').val();
        //being asynchronous, there's no guarantee the first get will be executed before the second
        $.get('/search',
        	{
        		q: query 
        	}).done(function(data){
				data = JSON.parse(data);
				setVideo(data.items[0]);
				data.items.shift();//remove first element in order to iterate over the remaining ones
				createListOfThumbnails(data,"thumbnailSearch");

			});
	});
	//Per inizializzare currentPlayerVideo con l'oggetto di youtube del video iniziale.
	$.get('/search',
    	{
        	q: 'PfYnvDL0Qcw'
        }).done(function(data){
            data = JSON.parse(data);
            videoNamespace.setCurrentPlayerVideo(data.items[0]);
        });
	setRandom();
	$("span").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		setVideo(data);
	})
});