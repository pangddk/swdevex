
module.exports = function(app, db, passport, io) {

    function loggedIn(req, res, next) {
        if (req.user) {
            next();
        } else {
            res.redirect('/');
        }
    }

    function adminloggedIn(req, res, next) {
        if (req.user && req.user.role == 'admin') {
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
        var thinglist = undefined;
        var borrowlist = undefined;
        db.query('SELECT * FROM borrowhistory WHERE status=1 AND type="bring" AND userid=' + req.user.id, function(err, rows, fields) {
            if (err) {
                    throw err;
                    res.redirect('/');
                    return;
            }
            if(rows.length > 0){
                res.redirect('/');
                return;
            }
            db.query('SELECT * FROM thing WHERE cate=1', function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                    return;
                }
                thinglist = rows;
                db.query('SELECT * FROM thing INNER JOIN templist ON thing.idthing=templist.idthing AND templist.status=true AND templist.iduser= ' + req.user.id, function(err, rows, fields) {
                    if (err) {
                        throw err;
                        res.redirect('/');
                        return;
                    }
                    borrowlist = [];
                    for (x in rows) {
                        borrowlist.push({
                            id: rows[x].id,
                            name: rows[x].name
                        });
                    }
                    res.render('bring', { listThing: thinglist, wishlist: borrowlist});
                });
            });
        });
    });

    app.post('/bring/add', loggedIn, function(req, res) {
        var choose = req.body.choose;
        db.query('INSERT INTO templist (idthing, iduser) VALUES (' + choose + ', ' + req.user.id + ' )', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/bring');
                return;
            }
            res.redirect('/bring');
        });
    });

    app.get('/bring/delete', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE templist SET status=false WHERE status=true AND ' +
                 'id=' + choose;
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/bring');
                return;
            }
            res.redirect('/bring');
        });
    });

    app.post('/bring/save', loggedIn, function(req, res) {
        var chooses = req.body;
        var borrow_id = makeid();
        for(var k in chooses){
            console.log(k,chooses[k]);
            db.query('SELECT id, idthing FROM templist WHERE id=' + k, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/borrow');
                    return;
                }
                var delid = rows[0].id;
                var delidthing = rows[0].idthing;
                db.query('SELECT amount FROM thing WHERE idthing='+rows[0].idthing, function(err, rows, fields){
                    if (err) {
                        throw err;
                        res.redirect('/borrow');
                        return;
                    }
                    if (rows[0].amount - parseInt(chooses[k]) > 0 && parseInt(chooses[k]) > 0) {
                        db.query('INSERT INTO borrowhistory (idthing, userid, amount, idwork, type) VALUES (' + delidthing + ', ' + req.user.id + ',' + chooses[k] + ', "' + borrow_id + '", "bring" )', function(err, rows, fields) {
                            if (err) {
                                throw err;
                                res.redirect('/bring');
                                return;
                            }
                            var qr = 'UPDATE templist SET status=false WHERE status=true AND ' +
                                     'id=' + delid;
                            db.query(qr, function(err, rows, fields) {
                                if (err) {
                                    throw err;
                                    res.redirect('/bring');
                                    return;
                                }
                            });
                        });
                    }
                });
            });
        }
        res.redirect('/bring');
        return;
    });

    app.post('/bring', loggedIn, function(req, res) {
        var search = req.body.search;
        if(search == ""){
            res.redirect('/borrow');
            return;
        }
        var search = isNaN(req.body.search) ? 'name="' + req.body.search + '"':'idthing="' + req.body.search + '"';
        db.query('SELECT * FROM thing WHERE ' + search , function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/bring');
                return;
            }
            var thinglist = rows;
            if(thinglist.length <= 0){
                res.redirect('/bring');
                return;
            }
            db.query('SELECT * FROM thing INNER JOIN templist ON templist.status=true AND thing.idthing=templist.idthing AND templist.iduser=' + req.user.id , function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/bring');
                    return;
                }
                var borrowlist = [];
                for (x in rows) {
                    borrowlist.push({
                        id: rows[x].id,
                        name: rows[x].name
                    });
                }
                res.render('bring', { listThing: thinglist, wishlist: borrowlist});
            });
        });
    });


    app.get('/borrow', loggedIn, function(req, res) {
        var thinglist = undefined;
        var borrowlist = undefined;
        db.query('SELECT * FROM borrowhistory WHERE status=1 AND type="borrow" AND userid=' + req.user.id, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            if(rows.length > 0){
                res.redirect('/');
                return;
            }
            db.query('SELECT * FROM thing WHERE cate=0', function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/');
                    return;
                }
                thinglist = rows;
                db.query('SELECT * FROM thing INNER JOIN templist ON thing.idthing=templist.idthing AND templist.status=true AND templist.iduser=' + req.user.id , function(err, rows, fields) {
                    if (err) {
                        throw err;
                        res.redirect('/');
                        return;
                    }
                    borrowlist = [];
                    for (x in rows) {
                        borrowlist.push({
                            id: rows[x].id,
                            name: rows[x].name
                        });
                    }
                    res.render('borrow', { listThing: thinglist, wishlist: borrowlist});
                });
            });
        });
    });

    app.post('/borrow/add', loggedIn, function(req, res) {
        var choose = req.body.choose;
        db.query('INSERT INTO templist (idthing, iduser) VALUES (' + choose + ', ' + req.user.id + ' )', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/borrow');
                return;
            }
            res.redirect('/borrow');
        });
    });

    app.get('/borrow/delete', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE templist SET status=false WHERE status=true AND ' +
                 'id=' + choose;
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/borrow');
                return;
            }
            res.redirect('/borrow');
        });
    });

    app.post('/borrow/save', loggedIn, function(req, res) {
        var chooses = req.body;
        var borrow_id = makeid();
        for(var k in chooses){
            console.log(k,chooses[k]);
            db.query('SELECT id, idthing FROM templist WHERE id=' + k, function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/borrow');
                    return;
                }
                var delid = rows[0].id;
                var delidthing = rows[0].idthing;
                console.log( rows[0].idthing, delidthing);
                db.query('SELECT amount FROM thing WHERE idthing='+rows[0].idthing, function(err, rows, fields){
                    if (err) {
                        throw err;
                        res.redirect('/borrow');
                        return;
                    }
                    if (rows[0].amount - parseInt(chooses[k]) > 0 && parseInt(chooses[k]) > 0) {
                        db.query('INSERT INTO borrowhistory (idthing, userid, amount, idwork, type) VALUES (' + delidthing + ', ' + req.user.id + ',' + chooses[k] + ', "' + borrow_id + '", "borrow" )', function(err, rows, fields) {
                            if (err) {
                                throw err;
                                res.redirect('/borrow');
                                return;
                            }
                            var qr = 'UPDATE templist SET status=false WHERE status=true AND ' +
                                     'id=' + delid;
                            db.query(qr, function(err, rows, fields) {
                                if (err) {
                                    throw err;
                                    res.redirect('/borrow');
                                    return;
                                }
                            });
                        });
                    }
                }); 
            });
        }
        res.redirect('/borrow');
        return;
    });

    app.post('/borrow', loggedIn, function(req, res) {
        var search = req.body.search;
        if(search == ""){
            res.redirect('/borrow');
            return;
        }
        var search = isNaN(req.body.search) ? 'name="' + req.body.search + '"':'idthing="' + req.body.search + '"';
        db.query('SELECT * FROM thing WHERE ' + search , function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/borrow');
                return;
            }
            var thinglist = rows;
            if(thinglist.length <= 0){
                res.redirect('/borrow');
                return;
            }
            db.query('SELECT * FROM thing INNER JOIN templist ON templist.status=true AND thing.idthing=templist.idthing AND templist.iduser=' + req.user.id , function(err, rows, fields) {
                if (err) {
                    throw err;
                    res.redirect('/borrow');
                    return;
                }
                var borrowlist = [];
                for (x in rows) {
                    borrowlist.push({
                        id: rows[x].id,
                        name: rows[x].name
                    });
                }
                res.render('borrow', { listThing: thinglist, wishlist: borrowlist});
            });
        });
    });

    app.get('/userres', loggedIn, function(req, res) {
        db.query('SELECT * FROM user INNER JOIN borrowhistory ON user.username=borrowhistory.username AND borrowhistory.username="' + req.user.username + '" ', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('userres', { listThing: rows});
        });
    });

    app.get('/addthing', adminloggedIn, function(req, res) {
        res.render('admin/addthing');
    });

    app.post('/addthing', adminloggedIn, function(req, res) {
        var idthing = req.body.idthing;
        var namething = req.body.namething;
        var amount = req.body.amount;
        var least = req.body.least;
        var cate = req.body.cate;

        var insq = 'INSERT INTO thing ( idthing, name, amount, least, cate) VALUES (' +
                   '"' + idthing + '",' +
                   '"' + namething + '",' + 
                   '' + amount + ',' + 
                   '' + least + ',' +
                   '' + cate + ' )';
        
        db.query(insq, function(err, rows, fields) {
            if (err) {
                throw err;
                res.render('admin/addthing', { message: "ลองใหม่อีกครั้ง" });
                return;
            }
            res.render('admin/addthing', { message: "บันทึกเรียบร้อย" });
        });
    });

    app.get('/checkthing', adminloggedIn, function(req, res) {
        db.query('SELECT * FROM thing', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('admin/checkthing', { listThing: rows });
        });
    });

    app.post('/checkthing', adminloggedIn, function(req, res) {
        if(req.body.search == ""){
            res.redirect('/checkthing');
            return;
        }
        var search = isNaN(req.body.search) ? 'name="' + req.body.search + '"':'idthing="' + req.body.search + '"';
        db.query('SELECT * FROM thing WHERE ' + search , function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('admin/checkthing', { listThing: rows });
        });
    });

    app.post('/checkthing/delete', adminloggedIn, function(req, res) {
        var idthing = req.body.idthing;
        db.query('DELETE FROM thing WHERE idthing="' + idthing +'"', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/checkthing');
                return;
            }
            res.redirect('/checkthing');
        });
    });

    app.get('/adduser', adminloggedIn, function(req, res) {

        res.render('admin/adduser');
    });

    app.post('/adduser', adminloggedIn, function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var idrole = req.body.idrole;
        var name = req.body.nameuser;
        var surname = req.body.surname;
        var tel = req.body.tel;
        var passcode = req.body.passcode;
        var rfid = req.body.rfid;
        
        db.query('INSERT INTO user (username, password, roleid, nameuser, surname, tel, passcode, rfid) VALUES ("' + username + '", "' + password + '", ' + idrole +', "' + name + '", "' + surname + '", "' + tel + '", ' + passcode + ', ' + rfid + ' )', function(err, rows, fields) {
            if (err) {
                throw err;
                res.render('admin/adduser', { message: "ลองใหม่อีกครั้ง" });
                return;
            }
            res.render('admin/adduser', { message: "บันทึกเรียบร้อย" });
        });
    });

    app.get('/userdetail', adminloggedIn, function(req, res) {
        db.query('SELECT * FROM user WHERE status = 1', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('admin/userdetail', { listUser: rows });
        });
    });

    app.post('/userdetail', adminloggedIn, function(req, res) {
        if(req.body.search == ""){
            res.redirect('/userdetail');
            return;
        }
        var search = isNaN(req.body.search) ? 'username="' + req.body.search + '"':'id=' + req.body.search;
        db.query('SELECT * FROM user WHERE ' + search , function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('admin/userdetail', {listUser: rows });
        });
    });

    app.post('/userdetail/delete', adminloggedIn, function(req, res) {
        var uname = req.body.username;
        db.query('DELETE FROM user WHERE username="' + uname + '"', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/userdetail');
                return;
            }
            res.redirect('/userdetail');
        });
    });

    app.get('/history', adminloggedIn, function(req, res) {
        db.query('SELECT * FROM user, borrowhistory WHERE borrowhistory.userid=user.id GROUP BY borrowhistory.idwork ORDER BY borrowhistory.date DESC', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 1){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }else if(rows[i].status == 3){
                    rows[i].status = "returned";                    
                }
            }
            res.render('admin/history', { listThing: rows });
        });
    });

    app.post('/history', adminloggedIn, function(req, res) {
        if(req.body.search == ""){
            res.redirect('/history');
            return;
        }
        var search = 'user.nameuser="' + req.body.search + '"';
        db.query('SELECT * FROM borrowhistory INNER JOIN user ON user.id=borrowhistory.userid WHERE ' + search + ' GROUP BY borrowhistory.idwork', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 1){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }else if(rows[i].status == 3){
                    rows[i].status = "returned";                    
                }
            }
            res.render('admin/history', { listThing : rows });
        });
    });

    app.get('/show', loggedIn, function(req, res) {
        res.render('show');
    });

    app.get('/approve', loggedIn, function(req, res) {
        db.query('SELECT * FROM borrowhistory, user WHERE borrowhistory.userid= user.id AND borrowhistory.status=1 GROUP BY borrowhistory.idwork ', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('approve', { idwork: rows[0].idwork, listThing: rows });
        });
    });

    app.get('/approve/comfirm', adminloggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE borrowhistory SET status=2 WHERE status=1 AND ' +
                 'idwork=' + choose;
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/approve');
                return;
            }
            res.redirect('/noti');
        });
    });

    app.get('/return', loggedIn, function(req, res) {
        db.query('SELECT * FROM user, borrowhistory WHERE borrowhistory.userid= user.id AND borrowhistory.status=2 AND borrowhistory.type = "borrow" GROUP BY borrowhistory.idwork ', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 1){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }
            }
            res.render('return', { listThing: rows });
        });
    });

    app.get('/return/delete', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE borrowhistory SET status=3 WHERE status=2 AND ' +
                 'idwork="' + choose + '"';
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/return');
                return;
            }
            db.query('UPDATE thing INNER JOIN borrowhistory ON thing.idthing=borrowhistory.idthing SET thing.amount=thing.amount+borrowhistory.amount WHERE borrowhistory.idwork = "'+ choose +'" AND thing.idthing=borrowhistory.idthing', function(err, rows, fields) {
                res.redirect('/return');
            });
        });
    });

    app.post('/api/rfid', function(req, res) {
        //var rfid = JSON.parse(req.body.rfid);
        var rfid = '2147488';
        var suTest = false;
        db.query('SELECT * FROM user WHERE user.rfid="' + rfid + '"', function(err, rows, fields) {
            if (err) {
                throw err;
                return;
            }
            if(rows && rows.length > 0){
                var qr = 'UPDATE borrowhistory SET status=4 WHERE status=1 AND ' +
                         'userid=' + rows[0].id;
                var userID = rows[0].id;
                db.query(qr, function(err, rows, fields) {
                    if (err) {
                        throw err;
                        return;
                    }
                    console.log(userID);
                    var qrs = 'SELECT * FROM borrowhistory WHERE status=4 AND ' +
                         'userid=' + userID;
                    db.query(qrs, function(err, rows, fields) {
                        if (err) {
                            throw err;
                            return;
                        }
                        io.emit('notification', { "messages" : rows.length });
                        suTest = true;
                    });
                });
            }
        });
        if(suTest){
            res.json({ "status": "successfull"});
        }else{
            res.status(404).send('404 Not found\n');
        }
    });

    app.get('/noti', loggedIn, function(req, res) {
        db.query('SELECT * FROM user, borrowhistory WHERE borrowhistory.userid= user.id AND borrowhistory.status=4 GROUP BY borrowhistory.idwork ', function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 4){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }
            }
            res.render('noti', { listThing: rows });
        });
    });

    app.post('/noti', adminloggedIn, function(req, res) {
        if(req.body.search == ""){
            res.redirect('/noti');
            return;
        }
        var search = isNaN(req.body.search) ? 'user.nameuser="' + req.body.search + '"':'borrowhistory.idwork="' + req.body.search + '"';
        db.query('SELECT * FROM borrowhistory, user WHERE ' + search + 'AND borrowhistory.status=1' + ' GROUP BY borrowhistory.idwork' , function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('noti', { listThing: rows });
        });
    });

    app.get('/detail', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var sq = 'SELECT borrowhistory.id, borrowhistory.idwork, thing.name, borrowhistory.amount, borrowhistory.date, borrowhistory.status ' +
                 'FROM borrowhistory INNER JOIN user ON ' + 
                 'borrowhistory.userid=user.id ' +
                 'and borrowhistory.status=4 INNER JOIN thing ON ' + 'borrowhistory.idthing=thing.idthing ' + 'WHERE idwork= "' + choose + '"';
        db.query(sq, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 4){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }
            }
            res.render('detail', { idwork: rows[0].idwork, listBorrow: rows, status: rows[0].status });
        });
    });

    app.get('/detail/delete', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE borrowhistory SET status=0 WHERE status=4 AND ' +
                 'idwork="' + choose + '"';
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/detail');
                return;
            }
            res.redirect('/noti');
        });
    });

    app.get('/detail/comfirm', adminloggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE borrowhistory SET status=2 WHERE status=4 AND ' +
                 'idwork="' + choose + '"';
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/detail');
                return;
            }
            console.log(rows);
            db.query('UPDATE thing LEFT JOIN borrowhistory ON ' +
                      'thing.idthing=borrowhistory.idthing SET ' +
                      'thing.amount=thing.amount-borrowhistory.amount ' +
                      'WHERE borrowhistory.idwork = "'+ choose +'" ' +
                      'AND thing.idthing=borrowhistory.idthing', function(err, rows, fields) {
                
                res.redirect('/noti');
            });
        });
    });


    app.get('/thingdetail', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var sq = 'SELECT borrowhistory.id, borrowhistory.idwork, thing.name, borrowhistory.amount, borrowhistory.date, borrowhistory.status ' +
                 'FROM borrowhistory INNER JOIN user ON ' + 
                 'borrowhistory.idwork="' + choose + '" and ' +
                 'borrowhistory.userid=user.id ' +
                 'and borrowhistory.status != 0 and user.id=' + req.user.id + ' INNER JOIN thing ON ' + 'borrowhistory.idthing=thing.idthing';
        db.query(sq, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 1){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }else if(rows[i].status == 3){
                    rows[i].status = "returned";                    
                }
            }
            res.render('thingdetail', { idwork: rows[0].idwork, listBorrow: rows, status: rows[0].status });
        });
    });

    app.get('/thingdetail/delete', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE borrowhistory SET status=0 WHERE status=1 AND ' +
                 'idwork="' + choose + '"';
        console.log(qr)
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/thingdetail');
                return;
            }
            res.redirect('/userhistory');
        });
    });

    app.get('/userhistory', loggedIn, function(req, res) {
        var sq = 'SELECT borrowhistory.id, borrowhistory.idwork, user.nameuser, user.surname, borrowhistory.date, borrowhistory.status ' +
                 'FROM borrowhistory INNER JOIN user ON ' + 
                 'borrowhistory.userid=user.id ' +
                 'and borrowhistory.status != 0 and user.id=' + req.user.id + ' GROUP BY borrowhistory.idwork ' + ' ORDER BY borrowhistory.date DESC';
        db.query(sq, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            for(var i in rows){
                if(rows[i].status == 1){
                    rows[i].status = "pending";
                }else if(rows[i].status == 2){
                    rows[i].status = "submited";
                }else if(rows[i].status == 0){
                    rows[i].status = "canceled";                    
                }else if(rows[i].status == 3){
                    rows[i].status = "returned";                    
                }
            }
            res.render('user/history', { listBorrow: rows });
        });
    });

    app.get('/userhistory/delete', loggedIn, function(req, res) {
        var choose = req.query.choose;
        var qr = 'UPDATE borrowhistory SET status=0 WHERE status=1 AND ' +
                 'idwork="' + choose + '"';
        db.query(qr, function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/userhistory');
                return;
            }
            res.redirect('/userhistory');
        });
    });

    app.post('/userhistory', loggedIn, function(req, res) {
        var search = req.body.search;
        if(search == ""){
            res.redirect('/userhistory');
            return;
        }
        var search = isNaN(req.body.search) ? 'idwork="' + req.body.search + '"':'status=' + req.body.search ;
        db.query('SELECT * FROM borrowhistory WHERE ' + search , function(err, rows, fields) {
            if (err) {
                throw err;
                res.redirect('/');
                return;
            }
            res.render('user/history', { listBorrow: rows });
        });
    });

    function makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 8; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
    });

};
