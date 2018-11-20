const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const request = require('request'); //http client
const getArtistTitle = require('get-artist-title');
var NB = require('nodebrainz');

var nb = new NB({userAgent:'Alphatube ( http://localhost:1823 )'});

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
			if(check.pageInfo.totalResults != 1){
				next(); //input is not videoId, next handler
			}else{
				res.json(body);
			}
		}
	);
});

app.get("/search", function(req,res,next){
	request(
		{
			url: "https://www.googleapis.com/youtube/v3/search",
			qs:{
				key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
				part: "snippet",
				maxResults: 30,
				q: req.query.q,
				type: "video",
				videoEmbeddable: true,
				videoSyndicated: true,
				videoLicense: "creativeCommon",
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
			videoSyndicated: true,
			videoLicense: "creativeCommon",
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
			videoSyndicated: true,
			videoLicense: "creativeCommon",
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
		var [artist, title] = getArtistTitle(req.query.titolo);
		res.send([artist,title]);
	}catch(error){
		res.send([null,null]);
	}
});

app.get("/similarity_genre",(req,res,next)=>{

	request({
		url: "https://www.googleapis.com/youtube/v3/search",
		qs: {
			key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
			part: "snippet",
			type: "video",
			videoCategoryId: "10",
			maxResults: 30,
			q: req.query.genre
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

app.listen(1823) ;//group number
console.log('listening');
