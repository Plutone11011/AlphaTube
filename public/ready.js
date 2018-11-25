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
				videoNamespace.setCurrentPlayerRecommender("Search");
				if(data.pageInfo.totalResults > 1){
					data.items.shift();//remove first element in order to iterate over the remaining ones
					createListOfThumbnails(data,"Search");
				}
			}
		});
	});
	$(".thumbnails").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		console.log("ho cliccato");
		//un elemento contiene solo il suo oggetto del video.
		setVideo(data);
		//setto il campo recommender del video attuale.
		videoNamespace.setCurrentPlayerRecommender($(this).parent().attr('class'));
		//focus sul player. NON FUNZIONA!
		$(player.getIframe()).focus();
	})

	//Save current settings if user is evil and leaves us.
	$(window).on("unload", saveSessionCookie);
});