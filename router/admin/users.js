var express = require('express');
var router = express.Router();
var DB = require('../../modules/mongodb');
var multiparty = require('multiparty');
var md5 = require('md5');
// app.use(express.static('staticAssets'));

router.get('/', function (req, res) {
    DB.find('user', {}, (data) => {
        res.render("admin/user/userList.ejs", { users: data });
    });
})

router.get('/user-add', function (req, res) {
    res.render("admin/user/userAdd.ejs", {});
})

router.post('/done-add-user', function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
        }
        // console.log(fields);
        let username = fields.username[0];
        let password = md5(fields.password[0]);
        let auth = fields.auth[0];
        let status = "1";
        let id = Number(fields.staffnum[0]);
        DB.insert('user', {
            username: username,
            password: password,
            auth: auth,
            status: status,
            id: id
        }, (data) => {
            res.send("<script>alert('User created'); location.href='/admin/login';</script>");
        })
    });
})

router.get('/user-edit', function (req, res) {
    let id = req.query.id;
    //in order to get mongodb built-in id, need ObjectID ({"_id":new DB.ObjecyID(id)}) 
    DB.find('user', { "_id": new DB.ObjectID(id) }, (data) => {
        // console.log(data[0]);
        res.render("admin/user/userEdit.ejs", { user: data[0] });
    });
})
router.post('/done-edit-user', function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        // console.log("=>", fields);
        if (err) {
            console.log(err);
        }
        let _id = fields._id[0];
        if (fields.password[0] != '') {
            var password = md5(fields.password[0]);
        }
        let auth = fields.auth[0];
        DB.update('user', { "_id": new DB.ObjectID(_id) }, {
            password: password,
            auth: auth
        }, (data) => {
            res.redirect('/admin/users');
        });
    });
})

router.use(function (req, res, next) {
    // console.log(url.parse(req.url).pathname);
    if (url.parse(req.url).pathname == '/userdelete') {
        console.log("called");
        if (app.locals['userinfo'].auth == 'supervisor') {
            next();
        } else {
            res.send("<script>alert('Permission denied. You have to be supervisor.'); location.href='/userlist';</script>");
        }
    }
})

router.get('/user-delete', function (req, res) {
    let id = req.query.id;
    DB.delete('user', { "_id": new DB.ObjectID(id) }, (data) => {
        res.send("<script>alert('User deleted.'); location.href='/admin/users';</script>");
    });
})

module.exports = router;