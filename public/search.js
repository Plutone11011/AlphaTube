

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
				console.log(data);
				setVideo(data.items[0]);
				data.items.shift();//remove first element in order to iterate over the remaining ones
				createListOfThumbnails(data,"thumbnailSearch");

			});
	});
	setRandom();

});
