const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const getArtistTitle = require('get-artist-title');
//var promiseFinally = require('promise.prototype.finally');
// destructuring assignment syntax is a JavaScript expression that makes it possible to unpack values from arrays, 
//or properties from objects, into distinct variables.
const {Client} = require('virtuoso-sparql-client'); 
const DbPediaClient = new Client('http://dbpedia.org/sparql');
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
	//console.log(req.query);
	res.sendFile(path + "index.html");
	next();
});


app.get("/",function(req,res,next){
	if (req.query.titolo){
		var response ;
		let [ artist, title ] = getArtistTitle(req.query.titolo);
		title = title.replace(" ","_");//for dbpedia resource names
		const prefixes = {
			dbo: "http://dbpedia.org/ontology/",
			db: "http://dbpedia.org/resource/"
		}
		DbPediaClient.setOptions('application/sparql-results+json',prefixes);
		DbPediaClient.query("SELECT ?abstract WHERE { db:"+title+
		" dbo:abstract ?abstract. FILTER langMatches(lang(?abstract),'en') }")
		.then((data)=>{
			response = data["results"]["bindings"][0]["abstract"]["value"] ;
		})
		.catch((error)=>{
			console.log(error);
		});
	}
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
