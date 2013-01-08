var querystring = require('querystring');
var https = require('https');

function set_routes(app, redisclient, session){
  app.get("/", function(req, res){
    if(!session.has_access())
      session.prompt_for_auth(res);
    else
      res.render('index', { string: "oh hey there!" });
  });
  app.get("/oauth2callback", function(req, res){
    oauthorization_code = req.query.code;
    console.log(oauthorization_code);

    var request_data = {
      code: oauthorization_code,
      client_id: session.client_id,
      client_secret: session.client_secret,
      redirect_uri: "http://localhost:8888/oauth2callback",
      grant_type: "authorization_code"
    }

    var post_header = {
      host: "accounts.google.com",
      path: "/o/oauth2/token",
      method: "POST",
      https: true,
      headers: {
        "Content-length": querystring.stringify(request_data).length,
        "Content-type": "application/x-www-form-urlencoded"
      }
    }

    var request = https.request(post_header, function(response){
      console.log("STATUS " + response.statusCode);
      response.setEncoding("utf8");
      response.on("data", function(chunk){
        parsedChunk = JSON.parse(chunk);
        if(chunk.error) console.log("ERROR: " + chunk.error);
        else{
          //accept the access/refresh tokens
          access_token = parsedChunk["access_token"];
          session.access_token = access_token;
          console.log("TOKEN: " + access_token);
          res.redirect(302, '/');
          res.end();
        }
      });
    });

    request.on("error", function(err){
      console.log("problem :" + err.message);
    });

    request.write(querystring.stringify(request_data));

    request.end();

  });
}

exports.set_routes = set_routes;
