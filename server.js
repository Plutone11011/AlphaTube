const express = require('express');
const getArtistTitle = require('get-artist-title');
var path = require('path') ; 
var app = express(); //app object is express application
var bodyParser = require('body-parser'); //to parse requests body

var routes = require('./routes/index');
/*mounting middlewares*/
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true })); // to parse application/x-www-form-urlencoded, which is default mime type
app.use(express.static(path.join(__dirname,'public')));

//routes will handle requests matching this path
app.use('/',routes);

app.listen(3000) ;
console.log('listening');