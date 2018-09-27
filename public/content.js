//description is data.items[0].snippet.description
function setDescription(description){
    $("#descrizione").html('<p>' + description + '</p>');
}

//id is data.items[0].id.videoId
function setComments(id){
    $.get(
        'https://www.googleapis.com/youtube/v3/commentThreads',
        {
            part: 'snippet, replies',
            key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
            videoId: id,
            textFormat: 'plainText'
        }).done(function(data){
            //topLevelComment: comment resource
            //snippet.authorDisplayName: autore del commento
            //snippet.textDisplay: testo del commento
            var commenti = '' ;
            $.each(data.items, (index,value)=>{
                commenti += '<p><span class="autori">' + value.snippet.topLevelComment.snippet.authorDisplayName + '</span>: ' +
                value.snippet.topLevelComment.snippet.textDisplay + '</p>';
            })
            $('#commenti').html(commenti);
            $('.autori').css("font-weight", "bold");
            $('#commenti > p').css("overflow-break", "break-word");

        });
}
/*
function setContentBrano(videoId){
    var obj = { titolo: 'ciao' } ;
    $.ajax({
        url: 'http://localhost:3000',
        data: JSON.stringify(obj),
        dataType: 'json',
        contentType: 'application/json',
        success: (data)=>{
            console.log('meh');
            console.log(data);
        },
        error: (data)=>{
            console.log('mah');
            console.log(data);
        }
    })
}
*/

function setContentBrano(videoId){
    $.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
            part:'snippet, topicDetails',
            maxResults: 1,
            key:'AIzaSyADhaxguT2HLfSM0ALnEpejHVvZw1vlbFU',
            id: videoId
        }
        ).done((data)=>{
            var obj = { titolo: data.items[0].snippet.title } ;
            $.ajax({
                url: 'http://localhost:3000',
                data: obj,
                dataType: 'json',
                success: (data)=>{
                    $("#wikipedia").html('<p>' + data.abstract + '</p>');
                },
                error: (data)=>{
                    console.log(data);
                }
            });
            /*
            var url = "http://dbpedia.org/sparql";
            var result ; //query result
            //var offset = 0 ;
            var titolo = "\"" + data.items[0].snippet.title + "\"" + "@en" ;

            //do{
                var query = ["PREFIX db: <http://dbpedia.org/resource/>",
                        "PREFIX dbo: <http://dbpedia.org/ontology/>", 
                        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>",
                        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>",
                        "PREFIX mo: <http://purl.org/ontology/mo/>", 
                        "PREFIX dc: <http://purl.org/dc/elements/1.1/>",
                        //"PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
                        //"PREFIX sg: <http://dbpedia.org/resource/song>",
                        "SELECT ?abstract ?music",
                        "WHERE {",
                        "?music a dbo:MusicalWork ;",
                        "rdfs:label ?lab;", //@en cause there are different labels depending on language
                        "dbo:abstract ?abstract.",
                        "FILTER langMatches(lang(?abstract),'en')",
                        "FILTER contains("+ titolo + ",?lab)}"].join(" "); //video title must contain label
                        //"ORDER BY DESC(?music)",
                        //"OFFSET "+ offset].join(" ");
                var queryUrl = url+"?query=" + encodeURIComponent(query); //codifica caratteri speciali con la sintassi %AA
                $.ajax({
                    url: queryUrl,
                    beforeSend: function(xhr){
                        xhr.setRequestHeader('Accept','application/sparql-results+json');
                    },
                    success: function(data){
                        console.log(data);
                        result = data.results.bindings;
                        for ( var i in result ) {
                            var res = result[i].abstract.value; //results è un oggetto che come chiave ha la variabile legata nella query
                            console.log(res);
                        }

                    },
                    error: function(data){
                        console.log(data);
                    }
                });
            //    offset += 10000 ;
            //} while(!result);
        */    
        });
}

