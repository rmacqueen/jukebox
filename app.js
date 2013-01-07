var express = require('express');
var routes = require('./routes');

var app = express();

//app.use(express.static('public'));
app.set('view engine', require('jade'));
app.set('views', './views');
routes.set_routes(app);

app.listen(8888);
