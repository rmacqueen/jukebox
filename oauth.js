var events = require('events');
var http = require('http');
var https = require('https');

module.exports.Session = Session;

function Session(){
  this.client_id = "547724229363.apps.googleusercontent.com";
  this.client_secret = "JF0R03TVdwrfbVFmBknC1sbF";
  this.redirect_uri = "http://localhost:8888/oauth2callback";
  this.scope = "https://gdata.youtube.com";
  this.response_type = "code";
  this.access_type = "offline";
  this.oauth_url = "https://accounts.google.com/o/oauth2/auth?" +
              "&client_id=" + this.client_id +
              "&redirect_uri=" + this.redirect_uri +
              "&scope=" + this.scope +
              "&response_type=" + this.response_type +
              "&access_type=" + this.access_type;
  this.access_token = null;

    events.EventEmitter.call(this);
}

Session.super_ = events.EventEmitter;
Session.prototype = Object.create(events.EventEmitter.prototype, {
  constructor: {
    value: Session,
    enumerable: false
  }
});

Session.prototype.has_access = function(){
  return !(this.access_token === null);
}

Session.prototype.prompt_for_auth = function(res){
  res.writeHead(302, {
    "Content-Type": "text/plain",
    "Location": this.oauth_url
  });
  res.end();
}


exports.Session = Session;
