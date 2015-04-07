var AWS = require("aws-sdk");
var os = require("os");
var helpers = require("../helpers");
AWS.config.loadFromPath('./config.json');
var s3 = new AWS.S3();
var crypto = require('crypto');

var task =  function(request, callback){

	var bucket =  request.query.bucket;
	var key =  request.query.key;
	var etag =  request.query.etag;

	var params = {
	  Bucket: bucket,
	  Key: key
	};

	s3.getObject(params, function(err, data) {
	  if (err) console.log(err, err.stack); // an error occurred
	  else   {
		console.log(data);           // successful response
		
		var algorithms = ['sha1', 'md5', 'sha256', 'sha512']
		var loopCount = 1;
		var doc = data.Body;
		helpers.calculateMultiDigest(doc, algorithms, 
		function(err, digests) {
			
			
			
		callback(null,'<br>bucket: '+bucket
			+"<br>key: "+key
			+"<br>etag: "+etag
			+"<br>IP: "+data.Metadata.ip
			+"<br>Uploader: "+data.Metadata.uploader
			+"<br><a href='http://"+bucket+".s3.amazonaws.com/"+key+"'>Download</a>"
			+"<br>"+digests.join("<br>") + ("<hr>  <br>Service provided by: " + os.hostname())
			+"<br><pre>"+JSON.stringify(data, null, 4)+"</pre>"
		);	
		

		}, 
		loopCount);
		  
			


	  }  
	});


}

exports.action = task
