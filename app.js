// include packages
var express         = require('express');
var path            = require('path');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var bodyParser      = require('body-parser');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//config cookieParser
app.use(cookieParser("secret",{ path: "/"}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// include routes
var routes = require('./routes/routes')(app);

// create and run web application on port 8080 
var http = require('http').Server(app);
http.listen(8080);

