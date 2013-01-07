function set_routes(app){
  app.get("/", function(req, res){
    res.write("oh hey");
    res.end();
  });
}

exports.set_routes = set_routes;
