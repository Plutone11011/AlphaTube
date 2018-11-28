function createListOfThumbnails(data,linkClass){
    var counter;
    var thumbnailTemplate = "<span class="+linkClass+"><img src='' alt=''></span>" ;
    $("#"+linkClass).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    $.each(data.items, function(index, value){
        $(thumbnailTemplate).appendTo("#"+linkClass);
        counter = index + 1;
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').attr('src',value.snippet.thumbnails.medium.url);
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').data("video",value);
        $('span.' + linkClass +':nth-child(' + counter.toString() + ') > img').addClass("contains-data");
        //$('span.' + linkClass +':nth-child(' + counter.toString() + ') + .titles').append(value.snippet.title);
        //counter = parseInt(counter);
        
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