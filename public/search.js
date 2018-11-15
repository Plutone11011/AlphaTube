

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
				player.loadVideoById(data.items[0].id.videoId,0,'large');
				setDescription(data.items[0].snippet.description);
				setComments(data.items[0].id.videoId);
				setContentBrano(data.items[0].snippet.title);
				data.items.shift();//remove first element in order to iterate over the remaining ones
				createListOfThumbnails(data,"thumbnailSearch");
			});
	});
	


	function randomDate(start, end) {
		//Math.random() returns a float number between 0 and 1
		//returns random Date between start and end
    	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}

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
	
});
