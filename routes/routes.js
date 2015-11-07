module.exports = function(app) {
    var database = [
    	{id:1, username:'admin',password:'password',role:'admin'},
    	{id:2, username:'ppond',password:'password',role:'user'},
    ];

    var getUser = function(id){
        var auser = undefined;
        for(var i=0;i<=(database.length)-1;i++){
            if(database[i].id == id){
                auser = database[i];
            }
        }
        return auser;
    };

    app.get('/', function(req, res) {
    	if(req.signedCookies.usersession)
    		res.redirect('/home');
        res.render('user/login');
    });

    app.get('/home', function(req, res) {
    	if(!req.signedCookies.usersession)
    		res.redirect('/');
        res.render('index', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/bring', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('bring', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/borrow', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('borrow', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/return', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('return', { user: getUser(req.signedCookies.usersession) });
    });

    app.post('/auth', function(req, res) {
    	var username = req.body.username;
    	var password = req.body.password;
    	for(var i=0;i<=(database.length)-1;i++){
    		if(database[i].username == username && database[i].password){
    			res.cookie('usersession', database[i].id, {maxAge: 999999, httpOnly: false, signed: true});
    			res.redirect('/home');
    			return;
    		}
    	}
    	res.redirect('/');
    });

    app.get('/logout', function(req, res) {
        res.clearCookie('usersession');
        res.redirect('/');
    });

    app.get('/addthing', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('addthing', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/checkthing', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('checkthing', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/adduser', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('adduser', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/userdetail', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('userdetail', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/history', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('history', { user: getUser(req.signedCookies.usersession) });
    });

    app.get('/show', function(req, res) {
        if(!req.signedCookies.usersession)
            res.redirect('/home');
        res.render('showdetail', { user: getUser(req.signedCookies.usersession) });
    });

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("404 Not Found\n");
        res.end();
    });

};
