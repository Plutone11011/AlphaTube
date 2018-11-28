function createListOfThumbnails(data,linkClass){
    var counter;
    var thumbnailTemplate = "<img src='' alt=''>" ;
    var img ;
    $(`#${linkClass}`).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    $.each(data.items, function(index, value){
        $(thumbnailTemplate).appendTo(`#${linkClass}`);
        counter = index + 1;
        img = $(`div#${linkClass} > img:nth-child(${counter})`) ;
        img.attr('src',value.snippet.thumbnails.medium.url);
        img.data("video",value);
        img.addClass("contains-data img-responsive");

        
        
    });
    $(`#${linkClass}`).append(`<i id='${linkClass}icon_right' class='glyphicon glyphicon-chevron-left'></i>`);
    $(`#${linkClass}`).append(`<i id='${linkClass}icon_left' class='glyphicon glyphicon-chevron-right'></i>`);
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