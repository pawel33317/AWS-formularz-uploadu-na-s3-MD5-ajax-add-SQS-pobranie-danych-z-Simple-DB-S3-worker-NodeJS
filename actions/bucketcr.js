var AWS = require("aws-sdk");
var os = require("os");
var helpers = require("../helpers");
AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();


var task =  function(request, callback){

	var bucket =  request.query.bucket;
	var key =  request.query.key;
	var etag =  request.query.etag;
	
	var algorithms = request.body.alg ? Object.keys(request.body.alg) : [];
	var loopCount = request.body.loop ? request.body.loop : 1;
	var doc = request.body.txt ? request.body.txt : "";
	
		
	var params = {
	  Bucket: bucket,
	  Key: key
	};
	
	s3.getObject(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else   {
		  
		  console.log(data);           // successful response
		  callback(null,'<br>bucket: '+bucket
			+"<br>key: "+key
			+"<br>etag: "+etag
			+"<br>IP: "+data.Metadata.ip
			+"<br>Uploader: "+data.Metadata.uploader
			
			+"<a href='http://"+bucket+".s3.amazonaws.com/"+key+"'>Download</a>"
			+"<br><pre>"+JSON.stringify(data, null, 4)+"</pre>"
);	
	  }  
	});


}

exports.action = task
