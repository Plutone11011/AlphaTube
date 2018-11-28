$(document).ready(function(){
	toggleVisibility(false,true);

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
        toggleVisibility(true,false);
        //being asynchronous, there's no guarantee the first get will be executed before the second
        $.get('/search',{
        	q: query
        }).done(function(data){
			data = JSON.parse(data);
			if(data.pageInfo.totalResults == 0){
				alert('No video found for '+query);
			}else{
				removeChannels(data);
				createFlexBoxOfThumbnails(data,"Search");
				}
		});
	});
	$(".thumbnails").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		console.log("ho cliccato");
		window.scrollTo({top: 0, behavior: 'smooth'});
		toggleVisibility(false,false);
		setVideo(data);
		//setto il campo recommender del video attuale.
		videoNamespace.setCurrentPlayerRecommender($(this).parents(".thumbnails").attr('id'));
	})

	//Save current settings if user is evil and leaves us.
	$(window).on("unload", saveLocalStorage);
});