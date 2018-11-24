const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const request = require('request'); //http client
const getArtistTitle = require('get-artist-title');

//var routes = require('./routes/index');
var app = express();
//var searchRouter = express.Router();
var path = __dirname + '/views/' ;
app.use(express.static(__dirname + '/public'));
/*mounting middlewares*/
app.use(bodyParser.json());
// to parse application/x-www-form-urlencoded, which is default mime type
app.use(bodyParser.urlencoded({ extended: true })); 


app.get("/",function(req,res,next){
	//console.log(req.query);
	//probably need to render list of initial videos
	res.sendFile(path + "index.html");
});

var objPopularity = (function(){

	var obj = {} ;

	function getObj(){
		return obj ;
	}

	//crea la proprietà di un id se non esiste
	function createIdProperty(videoId){
		if (!obj.hasOwnProperty(videoId)){
			obj[videoId] = {"timesWatched": 0, "relations": {}} ;
		}
	}
	//inizializza relazione
	function initializeRelation(a,b,recommender){
		createIdProperty(a);
		if(!obj[a]["relations"].hasOwnProperty(b)){
			obj[a]["relations"][b] = {"relationCount": 0, "recommender": {}}
			obj[a]["relations"][b]["recommender"][recommender] = 0;
		}else if(!obj[a]["relations"][b]["recommender"].hasOwnProperty(recommender)){
			obj[a]["relations"][b]["recommender"][recommender] = 0;
		}
	}

	//aggiunge il tempo di visione di un video, creando la proprietà prima
	function addtimeswatched(videoId,value){
		createIdProperty(videoId);
		obj[videoId]["timesWatched"] += value ;
	}

	//Aggiunge relazione a~b e, di conseguenza, b~a
	function addRelation(req, res, next){
		initializeRelation(req.body.previous, req.body.clicked, req.body.recommender);
		obj[req.body.previous]["relations"][req.body.clicked]["recommender"][req.body.recommender] += 1; 
		obj[req.body.previous]["relations"][req.body.clicked]["relationCount"] += 1;
		initializeRelation(req.body.clicked, req.body.previous, req.body.recommender);
		obj[req.body.clicked]["relations"][req.body.previous] = obj[req.body.previous]["relations"][req.body.clicked];
		next();
	}
	return {
		getObj: getObj,
		addtimeswatched: addtimeswatched,
		addRelation: addRelation
	}

})();

function setGenre(req,res,next){
	var queryString = '' ;
	for (var i = 0; i < req.query.genre.length; i++){
		queryString = queryString + req.query.genre[i]["lab"]["value"] ;
		if (i < req.query.genre.length - 1){
			//non voglio aggiungere pipe alla fine
			queryString = queryString + '|' ;
		}
	}
	res.locals.q = queryString ;
	next();
}

function searchVideo(req,res,query){
	request(
		{
			url: "https://www.googleapis.com/youtube/v3/search",
			qs:{
				key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
				part: "snippet",
				maxResults: 30,
				q: query,
				type: "video",
				videoEmbeddable: true,
				videoCategoryId: "10"
			}
		}, (error,response,body)=>{
			if(error || (response.statusCode != 200)){
				next(new Error(error));
				return;
			}else{
				res.json(body);
			}
		}
	);
}

app.get("/search", function(req,res,next){
	request(
		{
			url: "https://www.googleapis.com/youtube/v3/videos",
			qs: {
				key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
				part: "snippet",
				id: req.query.q,
				type: "video"
			}
		},(error,response,body)=>{
			if(error || (response.statusCode != 200)){
				next(new Error(error));
				return;
			}
			var check = JSON.parse(body);
			if(check.pageInfo.totalResults == 0){
				next(); //input is not videoId, next handler
			}else{
				res.json(body);
			}
		}
	);
});

app.get("/search", function(req,res,next){
	searchVideo(req,res,req.query.q);
});

app.get("/comments",(req,res,next)=>{
	request({
		url: "https://www.googleapis.com/youtube/v3/commentThreads",
		qs: {
			key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
			part: "snippet",
			videoId: req.query.id,
			textFormat: "plaintext"
		}
	}, (error,response,body)=>{
		if(error || (response.statusCode != 200)){
			next(new Error(error));
			return;
		}else{
			res.json(body);
		}
	});
});

app.get("/related",(req,res,next)=>{
	request({
		url: "https://www.googleapis.com/youtube/v3/search",
		qs: {
			key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
			part: "snippet",
			relatedToVideoId: req.query.id,
			type: "video",
			videoCategoryId: "10",
			videoEmbeddable: true,
			maxResults: 30
		}
	}, (error,response,body)=>{
		if(error || (response.statusCode != 200)){
			next(new Error(error));
			return;
		}else{
			res.json(body);
		}
	});
});

app.get("/channel",(req,res,next)=>{
	request({
		url: "https://www.googleapis.com/youtube/v3/search",
		qs: {
			key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
			part: "snippet",
			channelId: req.query.id,
			type: "video",
			videoCategoryId: "10",
			videoEmbeddable: true,
			maxResults: 30
		}
	}, (error,response,body)=>{
		if(error || (response.statusCode != 200)){
			next(new Error(error));
			return;
		}else{
			res.json(body);
		}
	});
});

app.get("/random",(req,res,next)=>{
	request({
		url: "https://www.googleapis.com/youtube/v3/search",
		qs: {
			key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
			part: "snippet",
			type: "video",
			videoCategoryId: "10",
			maxResults: 30,
			order: "viewCount",
			publishedBefore: req.query.mostRecentDate,
			publishedAfter: req.query.lessRecentDate,
			videoEmbeddable: true,
			safeSearch: "strict" //Mi è capitato uscissero dei porno (SU YOUTUBE WTF) :/
		}
	}, (error,response,body)=>{
		if(error || (response.statusCode != 200)){
			next(new Error(error));
			return;
		}else{
			res.json(body);
		}
	});
});

//routes will handle requests matching this path
//app.use('/',routes);

//parsa titolo youtube e ritorna artista e titolo brano
app.get("/artist_title",(req,res,next)=>{
	try{
		var [artist, title] = getArtistTitle(req.query.video.snippet.title);
		res.send([artist,title]);
	}catch(error){
		res.send([null,null]);
	}
});

app.get("/similarity_genre",setGenre,(req,res,next)=>{
	searchVideo(req,res,res.locals.q);
});

app.get("/firstList", (req,res)=>{
	request('http://site1825.tw.cs.unibo.it/video.json', function (error,response,body) {
		if(error || (response.statusCode != 200)){
			next(new Error(error));
			return;
		}else{
			res.json(body);
		}
	})
});

app.post("/localPopularity",(req,res,next)=>{
	objPopularity.addtimeswatched(req.body.video,req.body.timeswatched);
	res.send(objPopularity.getObj());
	//gestire update di json con un timeout
});

app.post("/relation", objPopularity.addRelation, function(req,res,next){
	console.log(objPopularity.getObj());
	res.send('POST successfull');
});

app.post("/watchTime",function(req,res,next){
	objPopularity.addtimeswatched(req.body.video,req.body.time);
	console.log(objPopularity.getObj());
	res.send("POST successful");
});

app.listen(8000) ;//group number
console.log('listening');
