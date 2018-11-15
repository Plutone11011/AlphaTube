const express = require('express'); 
const bodyParser = require('body-parser'); //to parse requests body
const request = require('request'); //http client
//var routes = require('./routes/index');
var app = express();

var path = __dirname + '/views/' ;
app.use(express.static('public'));
/*mounting middlewares*/
app.use(bodyParser.json());
// to parse application/x-www-form-urlencoded, which is default mime type
app.use(bodyParser.urlencoded({ extended: true })); 


app.get("/",function(req,res,next){
	//console.log(req.query);
	//probably need to render list of initial videos
	res.sendFile(path + "index.html");
});

app.get("/search",function(req,res,next){
	console.log(req.query);

	request(
		{
			url: "https://www.googleapis.com/youtube/v3/videos",
			qs: {
				key: "AIzaSyBPTl9bT1XI_EBkzQsEOEep1oJQFVDyvV4",
				part: "snippet",
				id: req.query.q,
				type: "video",
				videoCategoryId: "10",
				maxResults: 1
			}
		},(error,response,body)=>{
			if(body["items"]){
				res.json(body);//input is a video id	
			}
			else{
				//input is not a video id
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
						res.json(body);
					})
			}
		});

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
		res.json(body);
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
		res.json(body);
	});
});

//routes will handle requests matching this path
//app.use('/',routes);

app.listen(1823) ;//group number
console.log('listening');
