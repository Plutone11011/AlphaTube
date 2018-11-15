
//takes youtube api data
//places thumbnails in div with id attribute divId
function createListOfThumbnails(data,linkClass){
    var counter ;
    $.each(data.items ,function(index, value){
        counter = index + 1;
        $('a.' + linkClass +':nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url);
        //counter = parseInt(counter);
        
    });
}