

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
				setVideo(data.items[0]);
				data.items.shift();//remove first element in order to iterate over the remaining ones
				createListOfThumbnails(data,"thumbnailSearch");

			});
	});
	//Per inizializzare currentPlayerVideo con l'oggetto di youtube del video iniziale.
	$.get('/search',
    	{
        	q: 'PfYnvDL0Qcw'
        }).done(function(data){
            data = JSON.parse(data);
            videoNamespace.setCurrentPlayerVideo(data.items[0]);
        });
	setRandom();
	$("span").on("click", ".contains-data", function() {
		let data = $(this).data("video");
		setVideo(data);
	})
});
