$(document).ready(function(){
	toggleVisibility(false,true,false);

	//Back and forward listener.
	window.addEventListener('popstate', function(event){
		if(event.state != null){
			historyNamespace.setHistory(true);
			window.scrollTo({top: 0, behavior: 'smooth'});
			setVideo(event.state);
			toggleVisibility(false,false,false);
		} //return event.preventDefault(); //sembra non fare nulla...
	})

	//possible to search by title, artist, id, youtube title
	$('#search_bar').submit(function(e){
		e.preventDefault();//prevents the form from being submitted to the server
        $('.navbar-collapse').collapse('hide');
        var query = $('#search_bar input').val();
        player.pauseVideo();
        toggleVisibility(true,false,false);
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
				reasonsForRecommending.setSearch(query);
				addReasonsForSearch("Search");
			}
		});
	});
	$(".thumbnails").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		window.scrollTo({top: 0, behavior: 'smooth'});
		//Riposta a sinistra i recommender
		$('.thumbnails').animate({
			scrollLeft: "-=999999999999999"
		}, "fast");
		toggleVisibility(false,false,false);
		setVideo(data);
		//setto il campo recommender del video attuale.
		videoNamespace.setCurrentPlayerRecommender($(this).parents(".thumbnails").attr('id'));
	})

	$('.thumbnails').on({
		mouseenter: function() {
			$(this).parent().addClass('transition');
		},
		mouseleave: function() {
			$(this).parent().removeClass('transition');
		}
	},"img.contains-data");
	
	$(".horizontal-recommender").on('click', '.icon_left, .icon_right', function() {
		if($(this).attr('class') == 'icon_right') {

			$(this).siblings(".thumbnails").animate({
				scrollLeft: "+="+$(window).width()
			}, "slow");
		} else {
			$(this).siblings(".thumbnails").animate({
				scrollLeft: "-="+$(document).width()
			}, "slow");
		}
	});

	$(".jumbotron").on('click','.btn',function(){
		player.pauseVideo();
		toggleVisibility(false,true,true);
	})

	//Save current settings if user is evil and leaves us.
	$(window).on("unload", saveLocalStorage);
});