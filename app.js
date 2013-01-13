var express = require('express');
//var redis = require('redis');
var routes = require('./routes');
var oauth = require('./oauth');

//var client = redis.createClient();
var app = express();
var session = new oauth.Session();

/*client.on('error', function(err){
  console.log('Redis error: ' + err);
});*/
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

routes.set_routes(app, undefined, session);

app.listen(8888);
