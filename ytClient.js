
$(document).ready(function(){

	//per ora prova con un solo id, ma bisogna chiedere il json al server

	$.get(
		'https://www.googleapis.com/youtube/v3/videos',
		{
			id : 'LBQ2305fLeA',
			part : 'snippet', //oggetto che contiene informazioni su video come titolo, categoria, descrizione
			key: 'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU'//API key ottenuta con google dev console
		},
		function(data){	
			console.log(data);
			$.each(data.items, function(index, item){ //itera su oggetti jquery o array (diverso da $(selector).each() che itera solo su oggetti)
				console.log(item.snippet.title);	
			})
		}
	);
});