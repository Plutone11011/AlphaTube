var genereMusicale = (function(){
    var genre ;

    function getGenre(){
        return genre ;
    }

    function setGenre(g){
        genre = g ;
    }
    return {
        getGenre: getGenre,
        setGenre: setGenre
    }
})();

//description is data.items[0].snippet.description
function setDescription(description){
    $("#descrizione").html('<p>' + description + '</p>');
}

//id is data.items[0].id.videoId
function setComments(_id){
        $.get("/comments",{
            id: _id
        }).done(function(data){
            data = JSON.parse(data);
            //topLevelComment: comment resource
            //snippet.authorDisplayName: autore del commento
            //snippet.textDisplay: testo del commento
            var commenti = '' ;
            $.each(data.items, (index,value)=>{
                commenti += '<p><span class="autori">' + value.snippet.topLevelComment.snippet.authorDisplayName + '</span>: ' +
                value.snippet.topLevelComment.snippet.textDisplay + '</p>';
            });
            $('#commenti').html(commenti);
            $('.autori').css("font-weight", "bold");
            $('#commenti > p').css("overflow-break", "break-word");

        })
}


function fillWikiArea(song,artist){
    $("#wikipedia").html('<p> <span>Song</span>: ' + song + 
        '<br> <span>Artist</span>: '+ artist + '</p>');
    $("#wikipedia span").css("font-weight", "bold");
}

//builds sparql query with different resources
function getQuery(res, artist){
    let resource = "<http://dbpedia.org/resource/" + res + ">";
    //returns sparql query to get artist and song abstract from dbpedia ontology
    return ("PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+ 
    " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT distinct ?abstract ?genre ?artist WHERE { " + 
    resource +" dbo:abstract ?abstract ; dbo:genre ?genre . {"+resource+" dbo:artist ?a.} UNION {"+
    resource+" dbo:musicalArtist ?a.}"+
    "UNION {"+resource+" dbo:musicalBand ?a.} ?a dbo:abstract ?artist. ?a rdfs:label ?lab"+ 
    " FILTER (langMatches(lang(?abstract),'en') && langMatches(lang(?artist),'en'))"+
    " FILTER contains(?lab,'"+artist+"')}");
}

function setContentBrano(artist,title){
    
    console.log(title,artist);
    function getResultsFromQuery(dbpediaData){
        var artist_abstract = dbpediaData["results"]["bindings"][0]["artist"]["value"];
        var song_abstract = dbpediaData["results"]["bindings"][0]["abstract"]["value"];
        genereMusicale.setGenre(data["results"]["bindings"][0]["genre"]["value"]);
        return [song_abstract,artist_abstract] ;
    }
    var res1 = title.replace(/\s/g,"_");
    var res2 = title.replace(/\s/g,"_") + "_(song)" ;
    var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)";

    var query = getQuery(res1, artist);
    console.log(query);
    var url = "http://dbpedia.org/sparql" ;
    var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json" ;

    $.get(queryUrl).done((data)=>{
        if (data["results"]["bindings"].length){
            fillWikiArea(getResultsFromQuery(data)[0],getResultsFromQuery(data)[1]);
        }
        else {
            query = getQuery(res2, artist);
            queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json" ;
            $.get(queryUrl).done((data)=>{
                if (data["results"]["bindings"].length){
                    fillWikiArea(getResultsFromQuery(data)[0],getResultsFromQuery(data)[1]);
                }
                else {
                    query = getQuery(res3, artist);
                    queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json" ;
                    $.get(queryUrl).done((data)=>{
                        if (data["results"]["bindings"].length){
                            fillWikiArea(getResultsFromQuery(data)[0],getResultsFromQuery(data)[1]);
                        }
                        else {
                            artist_abstract = "No content found for this artist" ;
                            song_abstract = "No content found for this song" ;
                            genereMusicale.setGenre(null);
                            fillWikiArea(song_abstract,artist_abstract);
                        }
                    });
                }
            });
        }
    });
}



