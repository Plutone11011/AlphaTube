
//takes youtube api data
//places thumbnails in div with id attribute divId
function createListOfThumbnails(data,linkClass){
    var counter;
    console.log('recommender: ',linkClass,'data: ',data,'--> items: ',data.items);
    $.each(data.items, function(index, value){
    	//Dinamically create thumbnail space.
    	/*
    	if($('#'+recommender+'> span').length != 0){
    		$('<span class="' + linkClass + '"</span>').appendTo('#recommenderRandom').append('<img src="' + value.snippet.thumbnails.medium.url + '" alt="">');
        }
        */
        counter = index + 1;
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url);
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').data("video",value);
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').addClass("contains-data");
        //counter = parseInt(counter);
        
    });
}