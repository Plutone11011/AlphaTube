function createListOfThumbnails(data,linkClass){
    var  counterRow = 0;
    var counterCol = 1 ;
    var thumbnailTemplate = "<img src='' alt=''>" ;
    var img ;
    //console.log(linkClass, data);
    $(`#recommender${linkClass}`).empty(); //all'inizio svuoto l'html del div per aggiungere i nuovi thumbnail
    createGrid(data.items.length,linkClass);
    $.each(data.items, function(index, value){

        $(`#${linkClass}row${counterRow}`).children(`div:nth-child(${counterCol})`).html(thumbnailTemplate);
        img = $(`#${linkClass}row${counterRow}`).children(`div:nth-child(${counterCol})`).find("img") ;
        img.attr('src',value.snippet.thumbnails.medium.url);
        img.data("video",value);
        img.addClass("contains-data img-responsive");

        $(`#${linkClass}row${counterRow}`).children(`div:nth-child(${counterCol})`).append("<span></span>");
        $(`#${linkClass}row${counterRow}`).children(`div:nth-child(${counterCol})`).find("span").html(`Titolo: ${value.snippet.title}`);
        counterCol += 1 ;
        if (counterCol >= 5){
            counterCol = 1 ;
            counterRow += 1 ; //bisogna passare alle colonne della prossima riga
        }
    });
}

//linkClass può essere Recent, Random, AbsoluteLocalPopularity, GenreSimilarity,
// Related, Search, RelativeLocalPopularity, ArtistSimilarity
function createGrid(numberOfVideos, linkClass){
    //ogni colonna contiene un thumbnail
    var row ;
    //itera e crea righe in numero uguale alla divisione troncata tra il numero di video
    //da mostrare e il numero di colonne di una riga, poi controlla se c'è un resto
    if (numberOfVideos){
        for (var i = 0; i < Math.trunc(numberOfVideos/4)+1; i++){
            //numero le righe per poterci accedere successivamente più facilmente
            row = `<div class='row' id='${linkClass}row${i}' >
            <div class='col-md-3'></div>
            <div class='col-md-3'></div>
            <div class='col-md-3'></div>
            <div class='col-md-3'></div></div>`;
             $(`#recommender${linkClass}`).append(row);
        }
        if ((numberOfVideos % 4) == 0){
            //allora abbiamo creato una riga in più, la rimuovo
            $(`#recommender${linkClass}`).last().remove();
        }
    }
}