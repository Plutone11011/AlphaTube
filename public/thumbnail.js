/*
function createListOfThumbnails(data,linkClass){
    var counter;
    var thumbnailTemplate = "<img src='' alt=''>" ;
    var img ;
    $(`#${linkClass}`).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    $.each(data.items, function(index, value){
        $(thumbnailTemplate).appendTo(`#${linkClass}`);
        counter = index + 1;
        img = $(`div#${linkClass} > img:nth-child(${counter})`);
        img.attr('src',value.snippet.thumbnails.medium.url);
        img.data("video",value);
        img.addClass("contains-data");
        $(`div#${linkClass}`).append(`<span>${value.snippet.title}</span>`)

        
        
    });
    $(`.recommender${linkClass}`).append("<span class='icon_left' style='font-size: 70px; color:white'><i class='fas fa-angle-left'></i></span>");
    $(`.recommender${linkClass}`).append("<span class='icon_right' style='font-size: 70px; color:white'><i class='fas fa-angle-right'></i></span>");
}
*/
function createFlexBoxOfThumbnails(data,linkClass){
    //var  counterRow = 0;
    //var counterCol = 1 ;

    var thumbnailTemplate = "<li><div><img src='' alt=''></div></li>" ;
    var img, counter ;
    //console.log(linkClass, data);
    $(`#${linkClass} > ul`).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    //createGrid(data.items.length,linkClass);
    $.each(data.items, function(index, value){
        counter = index + 1 ;
        $(`#${linkClass} > ul`).append(thumbnailTemplate);
        img = $(`#${linkClass} > ul > li:nth-child(${counter})`).find("img") ;
        img.attr('src',value.snippet.thumbnails.medium.url);
        img.data("video",value);
        img.addClass("contains-data img-responsive");
        img.parent().append(value.snippet.title);
    });
}

function addReasons(linkClass){
    $(`#${linkClass} div`).append("<p></p>");
    $(`#${linkClass} div > p`).html(reasonsForRecommending.getReasons()[`${linkClass}`]);
    $(`#${linkClass} div > p`).css("color","black");
}

  
function addReasonsPopularity(linkClass){
    $.each(reasonsForRecommending.getReasons()[`${linkClass}`], function(index, value){
        $(`#${linkClass} > ul > li:nth-child(${index+1})`).find("div").append(`<p>${value}</p>`)
    });
    $(`#${linkClass} div > p`).css("color","black");    
}

function emptyThumbnails(linkClass){
	var emptyData = {items: []};
	createFlexBoxOfThumbnails(emptyData,linkClass);
}