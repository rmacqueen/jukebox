var querystring = require('querystring');
var https = require('https');
var http = require('http');

function set_routes(app, redisclient, session){
  app.get("/", function(req, res){
    if(!session.has_access())
      //need oauth access token; prompt process, redirect here after
      session.prompt_for_auth(res);
    else{
      if(req.query.q !== undefined){
        var cb = function(result){
          vids = [];
          for(i in result.feed.entry){
            vid = result.feed.entry[i];
            vid_data = {};
            vid_data.id = vid.id['$t'];
            vid_data.title = vid.title['$t'];
            vid_data.thumbnail_url = vid['media$group']['media$thumbnail'][1].url;
            vid_data.duration = vid['media$group']['yt$duration'].seconds;

            vids.push(vid_data);
          }

          res.render('index',
            { selected_playlist: session.selected_playlist,
              results: vids }
          );
        }
        session.search_videos(req.query.q, cb);
      }
      else{
        res.render('index',
          { selected_playlist: session.selected_playlist,
            results: undefined }
        );
      }
    }
  });

  app.get("/add", function(req, res){
    if(req.query.id == undefined){
      res.write('Need a video ID to add!');
      res.end();
    }
    else{
      var vid_id = req.query.id;
      var cb = function(result){
        console.log(result);
      }

      session.add_video(vid_id, cb);
      res.writeHead(302, {
        "Content-Type": "text/plain",
        "Location": "/"
      });
      res.end();
    }
  });

  app.get("/setup", function(req, res){
    if(!session.has_access())
      //need oauth access token; prompt process, redirect here after
      session.prompt_for_auth(res);
    else{
      var selected_playlist = undefined;
      if(req.query.id !== undefined)
        session.select_playlist(req.query.id);
      if(session.has_playlist_selected())
        selected_playlist = session.selected_playlist;
      //need user to select a playlist to use for jukebox
      var cb = function(result){
        playlists = result.feed.entry;
        console.log(playlists);
        res.render('setup',
          { playlists: playlists,
            selected_playlist: selected_playlist });
      }

      session.get_user_playlists(cb);
    }
  });

  app.get("/error", function(req, res){
    res.write('somethin goofed');
    res.end();
  });

  app.get("/oauth2callback", function(req, res){
    oauthorization_code = req.query.code;

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
      response.on("error", function(err){
        console.log("AUTH ERROR: " + err);
      });
      response.on("data", function(chunk){
        if(chunk.error){
          console.log("ERROR: " + chunk.error);
          res.redirect(302, '/error');
          res.end();
        }
        else{
          //accept the access/refresh tokens
          parsedChunk = JSON.parse(chunk);
          access_token = parsedChunk["access_token"];

          session.store_access_token(access_token);

          res.redirect(302, '/setup');
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
