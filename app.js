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

// mysql
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'softdev'
});

connection.connect();

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  	function(username, password, done) {
      var srtq = 'SELECT user.id, user.nameuser, user.surname, role.name AS role ' +
                 'FROM user INNER JOIN role ON ' + 
                 'user.username="' + username + '" ' +
                 'and user.password="' + password + '" ' +
                 'and role.id=user.roleid ' +
                 'and user.status=true';
  		connection.query(srtq, function(err, rows, fields) {
            if (err) {
              return done(err);
            }
            if (rows.length <= 0) {
	        	  return done(null, false);
	          }
	          var user = rows[0];
            return done(null, user);
      });
  	}
));

passport.serializeUser(function(user, done) {
  	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var srtq = 'SELECT user.id, user.nameuser, user.surname, role.name AS role ' +
               'FROM user INNER JOIN role ON ' + 
               'user.id=' + id + ' ' +
               'and role.id=user.roleid';
    connection.query(srtq, function(err, rows, fields) {
          if (err) {
              return done(err);
          }
          if (rows.length <= 0) {
          return done(null, false);
        }
        var user = rows[0];
        return done(null, user);
      });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat',
				  resave: true,
				  saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
    res.locals.user = req.user;
    next();
});

app.post('/auth', passport.authenticate('local', { 
	successRedirect: '/home',
	failureRedirect: '/',
	failureFlash: true })
);

app.get('/logout', loggedIn, function(req, res) {
    req.logout();
    res.redirect('/');
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// include routes
var routes = require('./routes/routes')(app, connection, passport);

// create and run web application on port 8080 
var http = require('http').Server(app);
http.listen(8080);

