
$(document).ready(function(){

	var thumbSearch = '<a href="" class="thumbnailSearch"><img src="" alt="Devi cercare qualcosa"></a>';
	for(let i=0; i < 29; i++){
		$('.listevideo').append(thumbSearch);
	}
	//possibile cercare video per titolo, nome canzone, nome artista, codice youtube
	$('#search_bar').submit(function(e){
		e.preventDefault();//previene il submit del form dopo aver cliccato submit button, non manda il form al server
        var query = $('#search_bar input').val();
        $.post("http://localhost:3000/?search=" + query,
        	{
        		q: query
        	})
        	.done((data)=>{
        		console.log(data);
        	})
        	.fail((data)=>{
        		console.log('stronzo');
        	});
        /*
        $.get(
        	'https://www.googleapis.com/youtube/v3/search',
        	{
        		part:'snippet',
        		key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
        		maxResults: 30,
        		q: query,
				type:'video',//il tipo di risposta può essere video, canale, o playlist
				videoCategoryId: '10'

			}).done(function(data){
				var counter ;
				//try{
					//metti primo video nell'iframe 
					$('iframe').attr('src','https://www.youtube.com/embed/' + data.items[0].id.videoId) ; //vedi search resource
					console.log(data.items[0].snippet.title);
					setDescription(data.items[0].snippet.description);
					setComments(data.items[0].id.videoId);
					setContentBrano(data.items[0].id.videoId);
					data.items.shift();//tolgo primo elemento perché voglio iterare sui restanti
					//crea lista thumbnail degli altri 29 video
					$.each(data.items ,function(index, value){
						counter = index + 1;
						$('a:nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url); //vedi search e snippet
						counter = parseInt(counter);
					
					});
		});
	*/
	});
});
