const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const {Client} = require('virtuoso-sparql-client'); 
var DbPediaClient = new Client('http://dbpedia.org/sparql');
//var routes = require('./routes/index');
var app = express();

var path = __dirname + '/views/' ;
app.use(express.static('public'));
/*mounting middlewares*/
app.use(bodyParser.json());
// to parse application/x-www-form-urlencoded, which is default mime type
app.use(bodyParser.urlencoded({ extended: true })); 

function getArtistTitle(ytTitle){
	//need to make some assumptions
	//split string into two substrings representing the artist name and title of the song
	var [artist, title] = ytTitle.split("-") ;
	console.log(artist,title);
	if (!artist || !title){
		return [null, null] ; //there wasn't a "-" in ytTitle
 	}
	else {
		//need to rule out other possible scenarios
		//sometimes in the title substring there's the name of the artist who made a featuring
		//or there's indication of explicit language, or official content
		var ind = {
			indexOfFt : title.search(/ft\./),
			indexOfOfficial : title.search("(Official)"),
			indexOfExplicit :  title.search("(Explicit)")
		};
		for (var i in ind){
			if (ind[i] != -1){
				title = title.slice(0,ind[i]).trim();
			}
		}
		return [artist.trim(), title.trim()] ;
	}
}

app.get("/",function(req,res,next){
	if (req.query.ytTitle){
		var artist_abstract, song_abstract ;
		var [ artist, title ] = getArtistTitle(req.query.ytTitle);
		if (artist && title){
		
			//making assumptions: wikipedia urls for songs are of three types( _ character in place of blank spaces):
			//1)song title 
			//2)song title plus "song" string
			//3)song title plus artist/band name plus "song" string 
			var res1 = title.replace(/\s/g,"_");
			var res2 = title.replace(/\s/g,"_") + "_(song)" ;
			var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)";
			console.log(res1,res2,res3);

			function getQuery(res){
				let resource = "<http://dbpedia.org/resource/" + res + ">";
				return ("SELECT ?abstract ?artist WHERE { " + resource +
				" dbo:abstract ?abstract. {"+resource+" dbo:artist ?a.} UNION {"+resource+" dbo:musicalArtist ?a.}"+
				"UNION {"+resource+" dbo:musicalBand ?a.} ?a dbo:abstract ?artist. ?a rdfs:label ?lab"+ 
				" FILTER (langMatches(lang(?abstract),'en') && langMatches(lang(?artist),'en'))"+
				" FILTER contains(?lab,'"+artist+"')}");
			}

			const prefixes = {
				dbo: "http://dbpedia.org/ontology/",
				rdfs: "http://www.w3.org/2000/01/rdf-schema#"
			}
			DbPediaClient.setOptions('application/sparql-results+json',prefixes);
			DbPediaClient.query(getQuery(res3))
			.then((data)=>{
				song_abstract = data["results"]["bindings"][0]["abstract"]["value"] ;
				artist_abstract = data["results"]["bindings"][0]["artist"]["value"] ;
				res.json({abstract: [song_abstract, artist_abstract]}) ;
			})
			.catch((error)=>{ //if the query doesn't return any result, try with another resource name
				DbPediaClient.query(getQuery(res2))
				.then((data)=>{
					song_abstract = data["results"]["bindings"][0]["abstract"]["value"] ;
					artist_abstract = data["results"]["bindings"][0]["artist"]["value"] ;
					res.json({abstract: [song_abstract, artist_abstract]}) ;		
				})
				.catch((error)=>{
					DbPediaClient.query(getQuery(res1))
					.then((data)=>{
						song_abstract = data["results"]["bindings"][0]["abstract"]["value"] ;
						artist_abstract = data["results"]["bindings"][0]["artist"]["value"] ;
						res.json({abstract: [song_abstract, artist_abstract]}) ;		
					})
					.catch((error)=>{
						console.log(error);
						res.json({abstract: ["No content found for this song","No content found for this artist"]});
					});
				});
			});
		}
		else {
			res.json({abstract: ["No content found for this song","No content found for this artist"]});
		}
	}
	else {
		next();
	}
});


app.get("/",function(req,res,next){
	//console.log(req.query);
	res.sendFile(path + "index.html");
});
/*
app.get('/',(req,res,next)=>{
	console.log(req);
	res.json({user: "Mario"});
});
*/

//routes will handle requests matching this path
//app.use('/',routes);

app.listen(3000) ;
console.log('listening');
