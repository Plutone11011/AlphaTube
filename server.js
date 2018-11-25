const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const request = require('request'); //http client
const getArtistTitle = require('get-artist-title');
const fs = require('fs');
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
	var interval;
	var obj = {} ; 
	//JSON.parse(fs.readFileSync('popularity.json', 'utf-8'));

	function getObj(){
		return obj ;
	}

	//salva obj su fs
	function savePopularity(){
		interval = setInterval(function() {
			fs.writeFile('popularity.json', JSON.stringify(obj),'utf-8',function(){
				console.log('Popularity saved');
			});
		}, 120000) //5minuti
	}

	//crea la proprietà di un id se non esiste
	function createIdProperty(videoId){
		if (!obj.hasOwnProperty(videoId)){
			obj[videoId] = {"watchTime": 0, "relations": {}, "timesWatched": 0} ;
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
		obj[videoId]["watchTime"] += Math.round(parseInt(value)/1000) ;
	}

	//Aggiunge relazione a~b
	function addRelation(req, res, next){
		initializeRelation(req.body.previous, req.body.clicked, req.body.recommender);
		obj[req.body.previous]["relations"][req.body.clicked]["recommender"][req.body.recommender] += 1; 
		obj[req.body.previous]["relations"][req.body.clicked]["relationCount"] += 1;
		next();
	}
	return {
		getObj: getObj,
		addtimeswatched: addtimeswatched,
		addRelation: addRelation,
		savePopularity: savePopularity
	}

})();

//punto di partenza
//setTimeout(objPopularity.savePopularity, 30000);

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

function searchVideo(res,query){
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
	searchVideo(res,req.query.q);
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
	searchVideo(res,res.locals.q);
});

app.get("/firstList", (req,res,next)=>{
	request('http://site1825.tw.cs.unibo.it/video.json', function (error,response,body) {
		if(error || (response.statusCode != 200)){
			next(new Error(error));
			return;
		}else{
			res.json(body);
		}
	})
});

app.get("/localPopularity",(req,res,next)=>{
	var arrayOfIdwatchTime = [] ; //array of objects
	for (var id in objPopularity.getObj()){
		var objId = new Object() ;
		objId[id] = objPopularity.getObj()[id]["watchTime"] ;
		arrayOfIdwatchTime.push(objId) ;
	}
	console.log(arrayOfIdwatchTime);
	//ordina id per watchTime
	arrayOfIdwatchTime.sort(function(a,b){
		return (a[Object.keys(a).toString()] - b[Object.keys(b).toString()]) ;
	});
	//togli gli ultimi id se ci sono più di 30 elementi
	if (arrayOfIdwatchTime.length > 30){
		arrayOfIdwatchTime = arrayOfIdwatchTime.slice(0,30);
	}
	res.send(arrayOfIdwatchTime);
});

app.post("/relation", objPopularity.addRelation, function(req,res,next){
	res.send('POST successfull');
});

app.post("/watchTime",function(req,res,next){
	//console.log(req.body.time);
	objPopularity.addtimeswatched(req.body.video,req.body.time);
	//console.log(objPopularity.getObj());
	res.send("POST successful");
});
/*
process.on('exit', () => {
	fs.writeFileSync('popularity.json', JSON.stringify(objPopularity.getObj()), 'utf-8');
})
*/
app.listen(8000) ;//group number
console.log('listening');
