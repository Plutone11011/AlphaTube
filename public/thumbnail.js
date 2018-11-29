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
        img.addClass("contains-data");

        
        
    });
    $(`.recommender${linkClass}`).append("<span class='icon_left' style='font-size: 70px; color:white'><i class='fas fa-angle-left'></i></span>");
    $(`.recommender${linkClass}`).append("<span class='icon_right' style='font-size: 70px; color:white'><i class='fas fa-angle-right'></i></span>");
    //add_icon('#icon_right', 'fa fa-chevron-right', '40px', 'white');
    //add_icon('#icon_left', 'fa fa-chevron-left', '40px', 'white');
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