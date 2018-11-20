const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const request = require('request'); //http client
const getArtistTitle = require('get-artist-title');
//var routes = require('./routes/index');
var app = express();
var searchRouter = express.Router();
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
			publishedBefore: req.query.mostRecentDate,
			publishedAfter: req.query.lessRecentDate
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

app.get("/similarity",(req,res,next)=>{
	console.log(req.query.titolo);
	console.log(req.query.recommender);
	try{
		var [artist, title] = getArtistTitle(req.query.titolo);
		if (parseInt(req.query.recommender)){
			next(); //need to pass artist, title
		}
		else{
			res.send([artist,title]);
		}
	}catch(error){
		console.log(error);
		res.send([null,null]);
	}
});

app.get("/similarity",(req,res,next)=>{
	console.log("heh");
	res.json("ah stronzo");
});

app.listen(1823) ;//group number
console.log('listening');
