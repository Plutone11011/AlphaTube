//Oggetto di YT del video attualmente sul player
let currentPlayerVideo = {};
//Array di oggetti di YT che sono stati sul player
let recentVideos = {items: []};
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

function getArtistTitle(ytTitle){
	//need to make some assumptions
	//split string into two substrings representing the artist name and title of the song
    var [artist, title] = ytTitle.split("-") ;
    //artist = artist.trim();
    //title = title.trim();
	if (!artist || !title){
		return [null, null] ; //there wasn't a "-" in ytTitle
 	}
	else {
		//need to rule out other possible scenarios
		//sometimes in the title substring there's the name of the artist who made a featuring
		//or there's indication of explicit language, or official content
		var ind = {
			indexOfFt : title.search(/ft\./),
			indexOfOfficial : title.search(/\(Official\)/),
			indexOfExplicit :  title.search(/\(Explicit\)/)
		};
		for (var i in ind){
			if (ind[i] != -1){
				title = (title.slice(0,ind[i])).trim();
			}
		}
		return [artist.trim(), title.trim()] ;
	}
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
    " PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT distinct ?abstract ?artist WHERE { " + 
    resource +" dbo:abstract ?abstract. {"+resource+" dbo:artist ?a.} UNION {"+resource+" dbo:musicalArtist ?a.}"+
    "UNION {"+resource+" dbo:musicalBand ?a.} ?a dbo:abstract ?artist. ?a rdfs:label ?lab"+ 
    " FILTER (langMatches(lang(?abstract),'en') && langMatches(lang(?artist),'en'))"+
    " FILTER contains(?lab,'"+artist+"')}");
}

function setContentBrano(ytTitle){
    
    var [artist, title] = getArtistTitle(ytTitle);
    if (artist && title){

        var res1 = title.replace(/\s/g,"_");
        var res2 = title.replace(/\s/g,"_") + "_(song)" ;
        var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)";

        var query = getQuery(res1, artist);
        var url = "http://dbpedia.org/sparql" ;
        var queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json" ;

        $.get(queryUrl).done((data)=>{
            if (data["results"]["bindings"].length){
                artist_abstract = data["results"]["bindings"][0]["artist"]["value"] ;
                song_abstract = data["results"]["bindings"][0]["abstract"]["value"] ;
                fillWikiArea(song_abstract,artist_abstract);
            }
            else {
                query = getQuery(res2, artist);
                queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json" ;
                $.get(queryUrl).done((data)=>{
                    if (data["results"]["bindings"].length){
                        artist_abstract = data["results"]["bindings"][0]["artist"]["value"] ;
                        song_abstract = data["results"]["bindings"][0]["abstract"]["value"] ;
                        fillWikiArea(song_abstract,artist_abstract);
                    }
                    else {
                        query = getQuery(res3, artist);
                        queryUrl = url+"?query="+ encodeURIComponent(query) +"&format=json" ;
                        $.get(queryUrl).done((data)=>{
                            if (data["results"]["bindings"].length){
                                artist_abstract = data["results"]["bindings"][0]["artist"]["value"] ;
                                song_abstract = data["results"]["bindings"][0]["abstract"]["value"] ;
                                fillWikiArea(song_abstract,artist_abstract);
                            }
                            else {
                                artist_abstract = "No content found for this artist" ;
                                song_abstract = "No content found for this song" ;
                                fillWikiArea(song_abstract,artist_abstract);
                            }
                        });
                    }
                });
            }
        });
    }   
    else{
        fillWikiArea("No content found for this song","No content found for this artist");
    }
            /*
                var obj = { ytTitle: data.items[0].snippet.title } ;
                $.ajax({
                    url: 'http://localhost:3000',
                    data: obj,
                    dataType: 'json',
                    success: (data)=>{
                        $("#wikipedia").html('<p> <span>Song</span>: ' + data.abstract[0] + 
                            '<br> <span>Artist</span>: '+ data.abstract[1] + '</p>');
                        $("#wikipedia span").css("font-weight", "bold");
                    },
                    error: (data)=>{ //during testing, gave 500 internal server error once, because of getArtistTitle
                        console.log(data);
                    }
            
            });*/
}
//Lancia una semplice query usando relatedToVideoId di YT.
function setRelated(_id){
	$.get('/related',{
		id: _id,
	}).done((data)=>{
		data = JSON.parse(data);
		console.log(data);
		createListOfThumbnails(data,"thumbnailRelated");
	})
}

//Riempe il div dei video recentemente visualizzati.
function setRecent(){
	createListOfThumbnails(recentVideos, "thumbnailRecent")
}

function randomDate(start, end) {
		//Math.random() returns a float number between 0 and 1
		//returns random Date between start and end
    	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function setRandom(){
	var data1 = randomDate(new Date(2005, 4, 25), new Date());
	var data2 = new Date(data1);
	data2.setMonth(data1.getMonth()+1);
	$.get('/random',{
		lessRecentDate: data1.toISOString(),
		mostRecentDate: data2.toISOString(),
		//videoCategoryId: '10',
		//type:'video',
		//maxResults: 30
	}).done((data)=>{
		data = JSON.parse(data);
		createListOfThumbnails(data,"thumbnailRandom");
	})
}

//Controllo tra i recenti, se il video nel player è già stato visualizzato. In caso positivo lo tolgo.
function removeIfRecent(){
	$.each(recentVideos.items, function(index, value){
        if(currentPlayerVideo.etag == value.etag){
        	recentVideos.items.splice(index,1);
        	return false;
        }       
    });
}
//Il video è stato in play per 15secondi, viene aggiunto ai Recent.
function addToRecent(){
	removeIfRecent();
	recentVideos.items.unshift(currentPlayerVideo);
}

// Carica video nel player e setta i vari box.
function setVideo(data){
	//Se il video è rimasto in play per 15secondi, lo aggiungo ai video recenti.
	if(player.getCurrentTime()>= 15){
		addToRecent();
	}
	player.loadVideoById(data.id.videoId,0,'large');
	currentPlayerVideo = data;
	setRelated(data.id.videoId);
	setRecent();
	setRandom();
	setDescription(data.snippet.description);
	setComments(data.id.videoId);
	setContentBrano(data.snippet.title);

}

