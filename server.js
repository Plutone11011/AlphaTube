const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const getArtistTitle = require('get-artist-title');
//var promiseFinally = require('promise.prototype.finally');
// destructuring assignment syntax is a JavaScript expression that makes it possible to unpack values from arrays, 
//or properties from objects, into distinct variables.
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

// Add finally() to Promise.prototype
//promiseFinally.shim() ;


app.get("/",function(req,res,next){
	if (req.query.titolo){
		var response ;
		//if it's a feat song the module will return "feat ..." as part of the title
		let [ artist, title ] = getArtistTitle(req.query.titolo);
		//wikipedia urls for songs are of three types(with _ character in place of blank spaces:
		//1)song title 
		//2)song title plus "song" string
		//3)song title plus artist/band name plus "song" string 
		var res1 = title.replace(/\s/g,"_");
		var res2 = title.replace(/\s/g,"_") + "_(song)" ;
		var res3 = title.replace(/\s/g,"_") + "_(" + artist.replace(/\s/g,"_") + "_song)";
		console.log(res1,res2,res3);
		function getQuery(res){
			return ("SELECT ?abstract WHERE { <http://dbpedia.org/resource/"+ res +
			"> dbo:abstract ?abstract FILTER langMatches(lang(?abstract),'en') }");
		}
		const prefixes = {
			dbo: "http://dbpedia.org/ontology/",
		}
		DbPediaClient.setOptions('application/sparql-results+json',prefixes);
		DbPediaClient.query(getQuery(res3))
		.then((data)=>{
			response = data["results"]["bindings"][0]["abstract"]["value"] ;
			res.json({abstract: response}) ;
		})
		.catch((error)=>{ //if the query doesn't return any result, try with another resource name
			DbPediaClient.query(getQuery(res2))
			.then((data)=>{
				response = data["results"]["bindings"][0]["abstract"]["value"] ;
				res.json({abstract: response}) ;		
			})
			.catch((error)=>{
				DbPediaClient.query(getQuery(res1))
				.then((data)=>{
					response = data["results"]["bindings"][0]["abstract"]["value"] ;
					res.json({abstract: response}) ;		
				})
				.catch((error)=>{
					console.log(error);
					res.json({abstract: "No content found for this song"});
				});
			});
		});
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
