var AWS = require("aws-sdk");
var os = require("os");
var crypto = require('crypto');

//zawiera funkcje pomocnicze generowania skrótów robienia z jonson obiektu ...
var helpers = require("../helpers");

//accessKeyId ... klucze do amazona 
AWS.config.loadFromPath('./config.json');

//obiekt dla instancji S3 z aws-sdk
var s3 = new AWS.S3();

//plik z linkiem do kolejki
var APP_CONFIG_FILE = "./app.json";

//dane o kolejce wyciągamy z tablicy i potrzebny link przypisujemy do linkKolejki
var tablicaKolejki = helpers.readJSONFile(APP_CONFIG_FILE);
var linkKolejki = tablicaKolejki.QueueUrl

//obiekt kolejki z aws-sdk
var sqs=new AWS.SQS();

//funkcja która zostanie wykonana po wejściu na stronę 
//request dane o zapytaniu, callback funkcja zwrotna zwracająca kod html
var task =  function(request, callback){

	//$_GET['bucket'], $_GET['key'], $_GET['etag']
	var bucket =  request.query.bucket;
	var key =  request.query.key;
	var etag =  request.query.etag;

	//tablica z parametrami do pobrania naszego wrzuconego pliku i meta danych dla getObject
	var params = {
		Bucket: bucket,
		Key: key
	};

	//pobieramy plik (obiekt) i dane o nim
	s3.getObject(params, function(err, data) {
	  if (err) {
		  console.log(err, err.stack);
	  }
	  else {
		  
		//Po poprawnym wrzuceniu pliku i pobraniu jego danych
		console.log("Plik zostal wrzucony poprawnie i jego dane zostaly odczytane.");  //console.log(data);

		//tablica z parametrami do wysłania wiadomości dla kolejki 
		var sendparms={
			//MessageBody: bucket+"###"+key,
			MessageBody: "{\"bucket\":\""+bucket+"\",\"key\":\""+key+"\"} ",
			QueueUrl: linkKolejki,
			MessageAttributes: {
				key: {//dowolna nazwa klucza
					DataType: 'String',
					StringValue: key
				},
				bucket: {//dowolna nazwa klucza
					DataType: 'String',
					StringValue: bucket
				}
			}
			
        };
	
		//wysłanie wiadomości do kolejki
        sqs.sendMessage(sendparms, function(err,data2){
            if(err) {
				console.log(err,err.stack);
			}
            else {
				console.log("Prosba o wyliczenie sktotu dodana do kolejki");
				console.log("MessageId: "+data2.MessageId);
			}

			
		//Funkcja zwracająca kod HTML wyświetlany na ekranie
		//jest tez zapytanie ajaksowe odpytujące getShortcut o skrót 
		callback(null,'<br>bucket: '+bucket
				+"<br>key: "+key
				+"<br>etag: "+etag
				+"<br>IP: "+data.Metadata.ip
				+"<br>Uploader: "+data.Metadata.uploader
				+"<br><a href='http://"+bucket+".s3.amazonaws.com/"+key+"'>Download</a>"
				+"<br>Skrót będzie wyliczony przez inny projekt z kolejki"
				+"<div id=\"skrot\" style=\"border:1px solid red;\">Oczekiwanie... </div>"
				+'<script>\n'
				+'function loadShortCut(){\n'
				+'	var xmlhttp;\n'
				+'	xmlhttp=new XMLHttpRequest();\n'
				+'	xmlhttp.onreadystatechange=function(){\n'
				+'		if (xmlhttp.readyState==4 && xmlhttp.status==200){\n'
				+'			if (xmlhttp.responseText.length){\n'
				+'				document.getElementById("skrot").innerHTML = xmlhttp.responseText;\n'
				+'			}\n'
				+'		}\n'
				+'	}\n'
				+'	xmlhttp.open("GET","getShortcut");\n'
				+'	xmlhttp.send();\n'
				+'	t = setTimeout("loadShortCut()", 5000);\n'
				+'}\n'
				+'setTimeout("loadShortCut()", 5000);\n'
				+'</script>\n'
				
				);	
        });
		
		
		/*wyliczenie skrótu przeniesione do innego projektu
		//Wyliczenie skrótu czyki sumy kontrolnej dla pliku 
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
				+"<br><pre>"+JSON.stringify(data, null, 4)+"</pre>");	
		}, loopCount);
		*/ 
		  
	  }  
	});
}
exports.action = task
