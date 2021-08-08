var express = require('express');
var router = express.Router();
var session = require('express-session');

var index = require('./admin/index.js');
var login = require('./admin/login');
var product = require('./admin/product');
var user = require('./admin/user');

router.use(session({
    secret: 'yaya app',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*24 },
    rolling: true
}));
router.use(function (req, res, next) {
    if (req.url == '/login' || req.url == '/login/done-login' || req.url == '/users/user-add'|| req.url == '/users/done-add-user'){
        next();
    } else {
        if (req.session.userinfo && req.session.userinfo.username != '') {
            console.log(req.session.userinfo);
            req.app.locals['userinfo'] = req.session.userinfo;
            next();
        } else {
            res.redirect('/admin/login');
        }
    }
})
router.use('/', index);
router.use('/login', login);
router.use('/products', product);
router.use('/users', user);

module.exports = router;