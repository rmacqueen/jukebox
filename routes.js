function set_routes(app){
  app.get("/", function(req, res){
    res.render('index.jade', { string: "oh hey there!" });
  });
}

exports.set_routes = set_routes;
