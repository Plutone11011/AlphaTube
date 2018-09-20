var express = require('express');
var router = express.Router();

router.get('/',(req,res,next)=>{
	console.log("/" + req.method);
});

/*
router.post('/search',(req,res,next)=>{
	console.log(req.body);
   	res.send("received your request!");
});
*/

module.exports = router ;
