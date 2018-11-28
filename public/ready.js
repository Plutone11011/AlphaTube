$(document).ready(function(){
	setListaIniziale();

	//Back and forward listener.
	window.addEventListener('popstate', function(event){
		if(event.state != null){
			historyNamespace.setHistory(true);
			window.scrollTo({top: 0, behavior: 'smooth'});
			setVideo(event.state);
		} //return event.preventDefault(); //sembra non fare nulla...
	})

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
					createFlexBoxOfThumbnails(data,"Search");
				}
			}
		});
	});
	$(".grid").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		console.log("ho cliccato");
		window.scrollTo({top: 0, behavior: 'smooth'});
		//un elemento contiene solo il suo oggetto del video.
		setVideo(data);
		//setto il campo recommender del video attuale.
		videoNamespace.setCurrentPlayerRecommender($(this).parents(".recommenders").attr('id'));
	})
	$(".thumbnails").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		console.log("ho cliccato");
		window.scrollTo({top: 0, behavior: 'smooth'});
		//un elemento contiene solo il suo oggetto del video.
		setVideo(data);
		//setto il campo recommender del video attuale.
		videoNamespace.setCurrentPlayerRecommender($(this).parent().attr('class'));
})

	//Save current settings if user is evil and leaves us.
	$(window).on("unload", saveLocalStorage);
});