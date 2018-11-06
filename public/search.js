

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
				//$('iframe').attr('src','https://www.youtube.com/embed/' + data.items[0].id.videoId+
				//	'?enablejsapi=1&origin=http://localhost:3000') ; //questo fa perdere controllo api
				player.loadVideoById(data.items[0].id.videoId,0,'large');
				setDescription(data.items[0].snippet.description);
				setComments(data.items[0].id.videoId);
				setContentBrano(data.items[0].id.videoId);
				data.items.shift();//remove first element in order to iterate over the remaining ones
				//create thumbnail list of the remaining 29 videos
				//need to add logic to clean recommender area after search by id
				$.each(data.items ,function(index, value){
					$('#recommenderSearch').append(thumbSearch);
					counter = index + 1;
					$('a:nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url); //vedi search e snippet
					//counter = parseInt(counter);
					
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
    		});
		console.log(window.history); 
	});
	


	function randomDate(start, end) {
    	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}

	var data1 = randomDate(new Date(2005, 4, 25), new Date());
	var data2 = new Date(data1);
	data2.setMonth(data1.getMonth()+1);
	console.log(data1,data2);
	$.get('https://www.googleapis.com/youtube/v3/search',{
		part: 'snippet',
		key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
		publishedAfter: data1.toISOString(),
		publishedBefore: data2.toISOString(),
		videoCategoryId: '10',
		type:'video',
		maxResults: 30
	}).done((data)=>{
		console.log(data);
		$.each(data.items ,function(index, value){
			$('#recommenderRandom').append(thumbSearch);
			counter = index + 1;
			$('a:nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url); //vedi search e snippet
			//counter = parseInt(counter);
			
		});
	})
	
});
