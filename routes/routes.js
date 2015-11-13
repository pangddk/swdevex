module.exports = function(app, db, passport) {

    function loggedIn(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    }

    app.get('/', function(req, res) {
    	if(req.user){
    		res.redirect('/home');
            return;
        }
        res.render('user/login');
    });

    app.get('/home', loggedIn, function(req, res) {
        res.render('index');
    });

    app.get('/bring', loggedIn, function(req, res) {
        res.render('bring');
    });

    app.get('/borrow', loggedIn, function(req, res) {
        res.render('borrow');
    });

    app.get('/return', loggedIn, function(req, res) {
        res.render('return');
    });

    app.get('/addthing', loggedIn, function(req, res) {
        res.render('addthing');
    });

    app.post('/addthing', loggedIn, function(req, res) {
        var idthing = req.body.idthing;
        var namething = req.body.namething;
        var amount = req.body.amount;
        var least = req.body.least;
        
        db.query('INSERT INTO thing (idthing, name, amount, least) VALUES (' + idthing + ', "' + namething + '", ' + amount + ', ' + least + ' )', function(err, rows, fields) {
            if (err) {
                throw err;
                res.render('addthing', { message: "ลองใหม่อีกครั้ง" });
                return;
            }
            res.render('addthing', { message: "บันทึกเรียบร้อย" });
        });
    });

    app.get('/checkthing', loggedIn, function(req, res) {
        db.query('SELECT * FROM thing', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('checkthing', { listThing: rows });
        });
    });

    app.post('/checkthing', loggedIn, function(req, res) {
        var search = req.body.search;
            if(isNaN(search)){
                db.query('SELECT * FROM thing WHERE name="' + search + '"', function(err, rows, fields) {
                    if (err) {
                        throw err;
                        res.redirect('/');
                        return;
                    }
                    res.render('checkthing', { listThing: rows });
                });
            } else {
                db.query('SELECT * FROM thing WHERE idthing=' + search, function(err, rows, fields) {
                    if (err) {
                        throw err;
                        res.redirect('/');
                        return;
                    }
                    res.render('checkthing', { listThing: rows });
                });
            }   
    });

    app.get('/adduser', loggedIn, function(req, res) {
        res.render('adduser');
    });

    app.post('/adduser', loggedIn, function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var name = req.body.nameuser;
        var surname = req.body.surname;
        var tel = req.body.tel;
        var passcode = req.body.passcode;
        var rfid = req.body.rfid;
        
        db.query('INSERT INTO user (username, password, nameuser, surname, tel, passcode, rfid) VALUES ("' + username + '", "' + password + '", "' + name + '", "' + surname + '", "' + tel + '", ' + passcode + ', ' + rfid + ' )', function(err, rows, fields) {
            if (err) {
                throw err;
                res.render('adduser', { message: "ลองใหม่อีกครั้ง" });
                return;
            }
            res.render('adduser', { message: "บันทึกเรียบร้อย" });
        });
    });

    app.get('/userdetail', loggedIn, function(req, res) {
        db.query('SELECT * FROM user', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('userdetail', { listUser: rows });
        });
    });

    app.post('/userdetail', loggedIn, function(req, res) {
        var search = req.body.search;
            if(isNaN(search)){
                db.query('SELECT * FROM user WHERE username="' + search + '"', function(err, rows, fields) {
                    if (err) {
                        throw err;
                        res.redirect('/');
                        return;
                    }
                    res.render('userdetail', {listUser: rows });
                });
            } else {
                db.query('SELECT * FROM user WHERE id=' + search, function(err, rows, fields) {
                    if (err) {
                        throw err;
                        res.redirect('/');
                        return;
                    }
                    res.render('userdetail', {listUser: rows });
                });
            }   
    });

    app.get('/history', loggedIn, function(req, res) {
        res.render('history');
    });

    app.get('/show', loggedIn, function(req, res) {
        res.render('show');
    });

    app.get('/approve', loggedIn, function(req, res) {
        res.render('approve');
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
    });

};
