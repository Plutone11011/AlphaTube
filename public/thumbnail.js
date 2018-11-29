function createListOfThumbnails(data,linkClass){
    var counter;
    var thumbnailTemplate = "<span class='img-titolo'><img src='' alt=''></span>" ;
    var img ;
    $(`#${linkClass}`).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    $.each(data.items, function(index, value){
        $(thumbnailTemplate).appendTo(`#${linkClass}`);
        counter = index + 1;
        img = $(`div#${linkClass} > span:nth-child(${counter})`).find('img');
        img.attr('src',value.snippet.thumbnails.medium.url);
        img.data("video",value);
        img.addClass("contains-data");
        $(`div#${linkClass} > span:nth-child(${counter})`).append(`<span class="titoli-thumbnail">${value.snippet.title}<br></span>`)     
    });
}

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

function emptyThumbnails(grid, linkClass){
	if(grid){
	var emptyData = {items: []};
	createFlexBoxOfThumbnails(emptyData,linkClass);
	}else{
	var emptyData = {items: []};
	createListOfThumbnails(emptyData,linkClass);
	}
}

function addReasonsForSearch(linkClass){
    $(`#${linkClass} div`).append("<p></p>");
    $(`#${linkClass} div > p`).html(reasonsForRecommending.getReasons()[`${linkClass}`]);
    $(`#${linkClass} div > p`).css("color","black");
}

//per relative, random, recent, similarity (genre e artist)
function addReasons(linkClass){
    $(`#${linkClass} .titoli-thumbnail`).append("<span class='reason'></span>");
    $(`#${linkClass} .titoli-thumbnail`).find(".reason").html(reasonsForRecommending.getReasons()[`${linkClass}`]);
    $(`#${linkClass} .reason`).css("color","blue");
}
//per popularity
function addReasonsPopularity(linkClass){
    $.each(reasonsForRecommending.getReasons()[`${linkClass}`], function(index, value){
        $(`#${linkClass} > .img-titolo:nth-child(${index+1}) > .titoli-thumbnail`).append("<span class='reason'></span>");
        $(`#${linkClass} > .img-titolo:nth-child(${index+1}) > .titoli-thumbnail`).find(".reason").html(value);
    });
    $(`#${linkClass} .reason`).css("color","blue");
}