var AWS = require("aws-sdk");

AWS.config.loadFromPath('./config.json');

var task =  function(request, callback){

	var bucket =  request.query.bucket;
	

callback(null,'zuploadowales plik'+bucket);	
}

exports.action = task
