

$(document).ready(function(){

	var thumbSearch = '<a href="" class="thumbnailSearch"><img src="" alt="Devi cercare qualcosa"></a>';

	function searchVideos(query,maxResults){
		$.get('https://www.googleapis.com/youtube/v3/search',
        	{
        		part:'snippet',
        		key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
        		maxResults: maxResults,
        		q: query,
				type:'video',//response could be of type video, playlist, channel
				videoCategoryId:'10'
			}).done(function(data){
				var counter ;
				$('iframe').attr('src','https://www.youtube.com/embed/' + data.items[0].id.videoId) ;
				setDescription(data.items[0].snippet.description);
				setComments(data.items[0].id.videoId);
				setContentBrano(data.items[0].id.videoId);
				data.items.shift();//remove first element in order to iterate over the remaining ones
				//create thumbnail list of the remaining 29 videos
				//need to add logic to clean recommender area after search by id
				$.each(data.items ,function(index, value){
					$('.listevideo').append(thumbSearch);
					counter = index + 1;
					$('a:nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url); //vedi search e snippet
					counter = parseInt(counter);
				
				});
			});
	}
	//possible to search by title, artist, id, youtube title
	$('#search_bar').submit(function(e){
		e.preventDefault();//prevents the form from being submitted to the server
        var query = $('#search_bar input').val();
        //being asynchronous, there's no guarantee the first get will be executed before the second
        $.get('https://www.googleapis.com/youtube/v3/videos',
        	{
        		part:'snippet',
        		key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
        		id: query 
        	}).done(function(data){
    			if(data.items.length){
    				searchVideos(query,1);//input is a video id	
    			}
    			else{
    				searchVideos(query,30); //input is not a video id
    			}
    		}) 
	});
	
});
