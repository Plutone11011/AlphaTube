
//takes youtube api data
//places thumbnails in div with id attribute divId
function createListOfThumbnails(data,linkClass){
    var counter;
    var thumbnailTemplate = "<span class="+linkClass+"><img src='' alt=''></span>" ;

    $("#recommender"+linkClass).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    $.each(data.items, function(index, value){
        $(thumbnailTemplate).appendTo("#recommender"+linkClass);
        counter = index + 1;
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url);
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').data("video",value);
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').addClass("contains-data");
        //counter = parseInt(counter);
        
    });
}