var express = require('express');
var routes = require('./routes');

var app = express();
routes.set_routes(app);

app.listen(8888);
