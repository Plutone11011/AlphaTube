
$(document).ready(function(){

	function getComments(id){
		$.get(
			'https://www.googleapis.com/youtube/v3/commentThreads',
			{
				part: 'snippet, replies',
				key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
				videoId: id,
				textFormat: 'plainText'
			},
			function(data){
				//topLevelComment: comment resource
				//snippet.authorDisplayName: autore del commento
				//snippet.textDisplay: testo del commento
				var commenti = '' ;
				$.each(data.items, (index,value)=>{
					commenti += '<p><span class="autori">' + value.snippet.topLevelComment.snippet.authorDisplayName + '</span>: ' + 
					value.snippet.topLevelComment.snippet.textDisplay + '</p>';
				})
				$('#commenti').html(commenti);
				$('.autori').css("font-weight", "bold");
				$('#commenti > p').css("overflow-break", "break-word");

			}	
		);
	}
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
					console.log(data);
					//metti primo video nell'iframe 
					$('iframe').attr('src','https://www.youtube.com/embed/' + data.items[0].id.videoId) ; //vedi search resource
					$('#descrizione').html('<p>' + data.items[0].snippet.description + '</p>');
					getComments(data.items[0].id.videoId);
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
							getComments(data.items[0].id);
							$('.thumbnailSearch > img').attr('src',"");
						});
				}		
			});
	//evento click per i recommender	
	//$('.listevideo').on("click","a",(e)=>{})
	});

});
