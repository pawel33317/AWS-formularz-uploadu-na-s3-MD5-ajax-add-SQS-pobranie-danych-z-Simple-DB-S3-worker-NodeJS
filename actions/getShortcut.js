var os = require("os");
fs = require('fs')
//zawiera funkcje pomocnicze generowania skrótów robienia z jonson obiektu ...
var helpers = require("../helpers");

//funkcja która zostanie wykonana po wejściu na stronę 
//request dane o zapytaniu, callback funkcja zwrotna zwracająca kod html
var task =  function(request, callback){

	//$_GET['bucket'], $_GET['key'], $_GET['etag']
	var bucket =  request.query.bucket;
	
    //odczytanie zawartości pliku
	fs.readFile('/home/bitnami/awslab4/actions/files/dane.s', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
			//Funkcja zwracająca kod HTML wyświetlany na ekranie
			callback(null,data);	
			console.log(data);
	});
}
exports.action = task
