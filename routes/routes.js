module.exports = function(app, db) {

    app.get('/', function(req, res) {
    	if(req.signedCookies.usersession)
    		res.redirect('/home');
        res.render('user/login');
    });

    app.get('/home', function(req, res) {
    	if(!req.signedCookies.usersession)
    		res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('index', { user: user });
            });
        });
    });

    app.get('/bring', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('bring', { user: user });
            });
        });
    });

    app.get('/borrow', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('borrow', { user: user });
            });
        });
    });

    app.get('/return', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('return', { user: user });
            });
        });
    });

    app.post('/auth', function(req, res) {
    	var username = req.body.username;
    	var password = req.body.password;
        db.query('SELECT * FROM user WHERE username="' + username + '" and password="' + password + '"', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            res.cookie('usersession', user.id, {maxAge: 999999, httpOnly: false, signed: true});
            res.redirect('/home');
        });
    });

    app.get('/logout', function(req, res) {
        res.clearCookie('usersession');
        res.redirect('/');
    });

    app.get('/addthing', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('addthing', { user: user });
            });
        });
    });

    app.get('/checkthing', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('checkthing', { user: user });
            });
        });
    });

    app.get('/adduser', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('adduser', { user: user });
            });
        });
    });

    app.get('/userdetail', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('userdetail', { user: user });
            });
        });
    });

    app.get('/history', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('history', { user: user });
            });
        });
    });

    app.get('/show', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/');
        db.query('SELECT * FROM user WHERE id=' + req.signedCookies.usersession, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
            }
            var user = rows[0];
            db.query('SELECT * FROM role WHERE id=' + rows[0].roleid, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                }
                user.roleid = rows[0].name;
                res.render('show', { user: user });
            });
        });
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
    });

};
