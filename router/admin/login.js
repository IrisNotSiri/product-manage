var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var session = require('express-session');

var md5 = require('md5');
var DB = require('../../modules/mongodb');

router.use(session({
    secret: 'yaya app',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*24 },
    rolling: true
}))

router.get('/', function (req, res) {
    res.render('admin/login.ejs');
})

//get post data
router.post('/done-login', function (req, res) {
    var username = req.body.username;
    var password = md5(req.body.password);
    DB.find('user', {
        "username": username,
        "password": password
    }, (err, data) => {
        if (err) {
            console.log("err finding user => ", err);
        }
        if (data.length > 0) {
            req.session.userinfo = data[0];
            res.redirect('/admin');
        } else {
            res.send("<script>alert('Username or password wrong!'); location.href='/admin/login';</script>");
        }
    });
})


router.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.send("<script>alert('Logout successfully!'); location.href='/admin/login';</script>");
        }
    });
})

module.exports = router;