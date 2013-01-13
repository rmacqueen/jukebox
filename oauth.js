var events = require('events');
var http = require('http');
var https = require('https');
var querystring = require('querystring');
var acct_info = require('./account');

module.exports.Session = Session;

function Session(){
  this.client_id = acct_info.client_id;
  this.client_secret = acct_info.client_secret;
  this.redirect_uri = acct_info.redirect_uri;
  this.developer_key = acct_info.developer_key;
  this.scope = acct_info.scope;
  this.response_type = acct_info.response_type;
  this.access_type = acct_info.access_type;
  this.oauth_url = "https://accounts.google.com/o/oauth2/auth?" +
              "&client_id=" + this.client_id +
              "&redirect_uri=" + this.redirect_uri +
              "&scope=" + this.scope +
              "&response_type=" + this.response_type +
              "&access_type=" + this.access_type;
  this.access_token = null;
  this.selected_playlist = null;

  events.EventEmitter.call(this);
}

Session.super_ = events.EventEmitter;
Session.prototype = Object.create(events.EventEmitter.prototype, {
  constructor: {
    value: Session,
    enumerable: false
  }
});

Session.prototype.store_access_token = function(token){
  this.access_token = token;
  console.log("GOT ACCESS TOKEN: " + token);
}

Session.prototype.has_access = function(){
  return !(this.access_token === null);
}

Session.prototype.has_playlist_selected = function(){
  return !(this.selected_playlist === null);
}

Session.prototype.select_playlist = function(playlist_id){
  this.selected_playlist = playlist_id;
}

Session.prototype.prompt_for_auth = function(res){
  res.writeHead(302, {
    "Content-Type": "text/plain",
    "Location": this.oauth_url
  });
  res.end();
}

Session.prototype.add_video = function(vid_id, callback){
  data = '<?xml version="1.0" encoding="UTF-8"?>' +
         '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007">'+
         '<id>'+vid_id+'</id>'+
         '</entry>';
  var options = {
    method: "POST",
    host: "gdata.youtube.com",
    headers: {
      "Authorization": "Bearer " + this.access_token,
      "X-GData-Key": "key=" + this.developer_key,
      "Content-length": data.length,
      "Content-type": "application/atom+xml"
    },
    path: "/feeds/api/playlists/" + this.selected_playlist +
          "?v=2" +
          "&alt=json"
  }

  console.log('PLLLLAAAAAYY ' + this.selected_playlist)

  this.api_call(options, callback, data);
}

Session.prototype.search_videos = function(query, callback){
  q = querystring.stringify({q: query});
  var options = {
    host: "gdata.youtube.com",
    path: "/feeds/api/videos?" +
          q +
          "&alt=json" +
          "&orderby=relevance" +
          "&max-results=10" +
          "&v=2",
    method: "GET"
  }

  this.api_call(options, callback);
}

Session.prototype.get_user_playlists = function(callback){
  var options = {
    host: "gdata.youtube.com",
    path: "/feeds/api/users/default/playlists?" +
          "v=2" +
          "&alt=json" +
          "&access_token=" + this.access_token,
    method: "GET"
  }

  this.api_call(options, callback);
}

Session.prototype.api_call = function(options, callback, data){
  var parse_result_cb = function(response){
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      console.log(str);
      var result = JSON.parse(str);
      callback(result);
    });

    response.on('error', function(err){
      console.log("ERROR: "+err);
    });
  }
  if(data === undefined)
    http.request(options, parse_result_cb).end();
  else{
    var req = http.request(options, parse_result_cb);
    req.write(data);
    req.end();
  }
}


exports.Session = Session;
