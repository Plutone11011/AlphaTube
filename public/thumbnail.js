
//takes youtube api data
//places thumbnails in div with id attribute divId
function createListOfThumbnails(data,divId){
    var thumbSearch = '<a href="" class="thumbnailSearch"><img src="" alt="Devi cercare qualcosa"></a>';

    $.each(data.items ,function(index, value){
        $('#'+divId).append(thumbSearch);
        counter = index + 1;
        $('a:nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url);
        //counter = parseInt(counter);
        
    });
}