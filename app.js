
$(document).ready(function(){

	var thumbSearch = '<a href="" class="thumbnailSearch"><img src="" alt="Devi cercare qualcosa"></a>';
	for(let i=0; i < 29; i++){
		$('.listevideo').append(thumbSearch);
	}
	setContent();
	//possibile cercare video per titolo, nome canzone, nome artista, codice youtube, da gestire (?)
	$('#search_bar').submit(function(e){
        e.preventDefault();//previene il submit del form dopo aver cliccato submit button, non manda al server

        var query = $('#search_bar input').val();

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
				try{
					//metti primo video nell'iframe 
					$('iframe').attr('src','https://www.youtube.com/embed/' + data.items[0].id.videoId) ; //vedi search resource
					$('#descrizione').html('<p>' + data.items[0].snippet.description + '</p>');
					setComments(data.items[0].id.videoId);
					data.items.shift();//tolgo primo elemento perché voglio iterare sui restanti
					//crea lista thumbnail degli altri 29 video
					$.each(data.items ,function(index, value){
						counter = index + 1;
						$('a:nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url); //vedi search e snippet
						counter = parseInt(counter);
					
					})
				} catch(err){
					//se c'è stato un errore è perché ha cercato per id
					$.get(
						'https://www.googleapis.com/youtube/v3/videos',
						{
							part:'snippet',
							key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
							id: query

						}
						).done(function(data){	
							$('#descrizione').html('<p>' + data.items[0].snippet.description + '</p>');
							$('iframe').attr('src','https://www.youtube.com/embed/' + data.items[0].id) ;
							setComments(data.items[0].id);
							$('.thumbnailSearch > img').attr('src',"");
						});
				}		
			});
	//evento click per i recommender	
	//$('.listevideo').on("click","a",(e)=>{})
	});

});
