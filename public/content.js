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

//ritorna query sparql
function sparqlQueryforArtistTitle(res, artist){
    let resource = "<http://dbpedia.org/resource/" + res + ">";
    //returns sparql query to get artist and song abstract from dbpedia ontology
    return ("PREFIX dbo: <http://dbpedia.org/ontology/> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+ 
    " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT distinct ?abstract ?artist WHERE { " + 
    resource +" dbo:abstract ?abstract . {"+resource+" dbo:artist ?a.} UNION {"+
    resource+" dbo:musicalArtist ?a.}"+
    "UNION {"+resource+" dbo:musicalBand ?a.} ?a dbo:abstract ?artist. ?a rdfs:label ?lab"+ 
    " FILTER (langMatches(lang(?abstract),'en') && langMatches(lang(?artist),'en'))"+
    " FILTER contains(?lab,'"+artist+"')}");
}

//costruisce get query per dbpedia con sparql query differenti
function buildQuery(DBPediaresource, artist, sparqlQuery){
    var query = sparqlQuery(DBPediaresource, artist);
    //console.log(query);
    var queryUrl = "http://dbpedia.org/sparql?query=" + encodeURIComponent(query) + "&format=json";
    return queryUrl ;
}

//ritorna i risultati della query a dbpedia
function getResultsFromQuery(dbpediaData){
    var artist_abstract = dbpediaData["results"]["bindings"][0]["artist"]["value"];
    var song_abstract = dbpediaData["results"]["bindings"][0]["abstract"]["value"];
    return [song_abstract,artist_abstract] ;
}

function noContentFound(){
    artist_abstract = "No content found for this artist" ;
    song_abstract = "No content found for this song" ;
    fillWikiArea(song_abstract,artist_abstract);
}

function setContentBrano(video){
    
    $.get("/artist_title",{ video: video}).done(function(data){
        artist = data[0];
        title = data[1];
        console.log(artist);
        console.log(title);
        if (artist && title){
            var res1 = title.replace(/\s/g,"_");
            var res2 = title.replace(/\s/g,"_") + "_(song)" ;
            var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)";

                $.get(buildQuery(res1,artist,sparqlQueryforArtistTitle)).done((data)=>{
                    if (data["results"]["bindings"].length){
                        fillWikiArea(getResultsFromQuery(data)[0],getResultsFromQuery(data)[1]);
                    }
                    else {
                        $.get(buildQuery(res2,artist,sparqlQueryforArtistTitle)).done((data)=>{
                            if (data["results"]["bindings"].length){
                                fillWikiArea(getResultsFromQuery(data)[0],getResultsFromQuery(data)[1]);
                            }
                            else {
                                $.get(buildQuery(res3,artist,sparqlQueryforArtistTitle)).done((data)=>{
                                    if (data["results"]["bindings"].length){
                                        fillWikiArea(getResultsFromQuery(data)[0],getResultsFromQuery(data)[1]);
                                    }
                                    else {
                                        noContentFound();
                                    }
                                }).fail(()=>{
                                    noContentFound();
                                });
                            }
                        }).fail(()=>{
                            noContentFound();
                        });
                    }
                }).fail(()=>{
                    noContentFound();
                });
        }
        else {
            noContentFound();
        }
    });
}



