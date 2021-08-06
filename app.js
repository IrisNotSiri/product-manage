var express = require('express');
var session = require('express-session');
var app = express();
var fs = require('fs');
var url = require('url');
app.use(express.static('staticAssets'));
app.use('/staticAssets/upload', express.static('staticAssets/upload'));
//文件目录staticAssets/upload/NodYbHl-F_ZYfBbGfm1kRhOa.jpeg 会被当作整体来到staticAssets目录下查找，无法找到；
//所以再设置一个虚拟目录，当文件目录以/staticAssets/upload/开头时，就到staticAssets/upload目录下，查找NodYbHl-F_ZYfBbGfm1kRhOa.jpeg文件


var multiparty = require('multiparty'); //既可以获取form的表单数据，又可以获取文件（图片）的数据
// var bodyParser = require('body-parser')
// app.use(bodyParser.urlencoded({ extended: false }))

// // parse application/json
// app.use(bodyParser.json())
var DB = require('./modules/mongodb.js')

var md5 = require('md5');
// var cookieParser = require('cookie-parser');
// app.use(cookieParser());

//in ejs, to set up global variable
// app.locals['userinfo'] = 'req.req.session.userinfo';

app.use(session({
    secret: 'yaya app',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000*60*60*24 },
    rolling: true
}))
// check if login, if no then no permission to other pages except login
app.use(function (req, res, next) {
    if (req.url == '/login' || req.url == '/doneLogin' || req.url == '/userAdd'|| req.url == '/doneAddUser'){
        next();
    } else {
        if (req.session.userinfo && req.session.userinfo != '') {
            app.locals['userinfo'] = req.session.userinfo;
            next();
        } else {
            res.redirect('/login');
        }
    }
})

app.get('/', function (req, res) {
    res.render('index.ejs');
})

//get post data
app.post('/doneLogin', function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
        }
        console.log(fields);
        var username = fields.username[0];
        var password = md5(fields.password[0]);
        DB.find('user', {
            "username": username,
            "password": password
        }, (err, data) => {
            if (err) {
                console.log("err finding user => ", err);
            }
            if (data.length > 0) {
                req.session.userinfo = data[0];
                res.redirect('/');
            } else {
                res.send("<script>alert('Username or password wrong!'); location.href='/login';</script>");
            }
        });
    });
})

//cookie setup, parameters: 1. cookie name  2. cookie value  3. cookie config
app.get('/login', function (req, res) {
    res.render('login.ejs');
    // res.send('login page');
})
app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.send("<script>alert('Logout successfully!'); location.href='/login';</script>");
        }
    });

})

app.get('/products', function (req, res) {
    DB.find('product', {}, (err, data) => {
        if (err) {
            console.log('err when finding product');
            return;
        }
        res.render("productsList.ejs", { product: data });
    });
})

app.get('/stockadd', function (req, res) {
    res.render("stockAdd.ejs");
})

app.post('/doneStockAdd', function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = './staticAssets/upload'; //destination of picture to be uploaded. Has to be existed
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
        }
        let name = fields.name[0];
        let name_CN = fields.name_CN[0];
        let price = fields.price[0];
        let id = fields.id[0];
        let stock = fields.stock[0];
        let onSale = fields.onSale[0];
        let category = fields.category[0];
        let ingredient = fields.ingredient[0];
        let picture = files.picture[0].path;
        DB.insert('product', {
            name: name,
            name_CN: name_CN,
            price: price,
            id: id,
            stock: stock,
            onSale: onSale,
            category: category,
            ingredient: ingredient,
            picture: picture
        }, (err, data) => {
            if (err) {
                console.log('err when insert product');
                return;
            }
            res.redirect('/products');
        });
    });
})

app.get('/stockedit', function (req, res) {
    let id = req.query.id;
    //in order to get mongodb built-in id, need ObjectID ({"_id":new DB.ObjecyID(id)}) 
    DB.find('product', { "_id": new DB.ObjectID(id) }, function (err, data) {
        if (err) {
            console.log('error when find editing product', err);
        }
        console.log("$$$", data);
        res.render("stockEdit.ejs", { product: data[0] });
    });
})

app.post('/doneProductEdit', function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = './staticAssets/upload';
    form.parse(req, function (err, fields, files) {
        console.log("=>", files);
        if (err) {
            console.log(err);
        }
        let _id = fields._id[0];
        let name = fields.name[0];
        let name_CN = fields.name_CN[0];
        let price = fields.price[0];
        let id = fields.id[0];
        let stock = fields.stock[0];
        let onSale = fields.onSale[0];
        let category = fields.category[0];
        let ingredient = fields.ingredient[0];
        let picture = files.picture[0].path;

        if (files.picture[0].originalFilename != '') {
            var valueObj = {
                name: name,
                name_CN: name_CN,
                price: price,
                id: id,
                stock: stock,
                onSale: onSale,
                category: category,
                ingredient: ingredient,
                picture: picture
            };
        } else {
            var valueObj = {
                name: name,
                name_CN: name_CN,
                price: price,
                id: id,
                stock: stock,
                onSale: onSale,
                category: category,
                ingredient: ingredient
                //if no new picture upload, don't update picture
            }
            //there will be a temporory file generated. Delete it
            fs.unlink(picture, () => { });
        }
        DB.update('product', { "_id": new DB.ObjectID(_id) }, valueObj, (err, data) => {
            if (err) {
                console.log("update product err", err)
                return;
            }
            res.redirect('/products');
        });
    });
})

app.get('/stockdelete', function (req, res) {
    let id = req.query.id;

    DB.delete('product', { "_id": new DB.ObjectID(id) }, (err, data) => {
        if (!err) {
            res.send("<script>alert('Product deleted.'); location.href='/products';</script>");
        }
    });
    // res.send("product is deleted");
})

app.get('/userlist', function (req, res) {
    DB.find('user', {}, (err, data) => {
        if (err) {
            console.log('err when finding all users');
            return;
        }
        res.render("userList.ejs", { users: data });
    });
})

app.get('/useradd', function (req, res) {
    // DB.find('user', {}, (err, data) => {
    //     if (err) {
    //         console.log('err when finding all users');
    //         return;
    //     }
        res.render("userAdd.ejs", {});
    // });
})

app.post('/doneAddUser', function(req, res){
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
        }
        console.log(fields);
        let username = fields.username[0];
        let password = md5(fields.password[0]);
        let auth = fields.auth[0];
        let status = "1";
        let id=Number(fields.staffnum[0]);
        DB.insert('user', {
            username:username,
            password:password,
            auth:auth,
            status:status,
            id:id
        }, (err, data)=>{
            if (err) {
                console.log('err when create new user', err);
                return;
            }
            res.send("<script>alert('User created'); location.href='/login';</script>");
        })
    });
})

app.get('/useredit', function(req,res){
    let id = req.query.id;
    //in order to get mongodb built-in id, need ObjectID ({"_id":new DB.ObjecyID(id)}) 
    DB.find('user', { "_id": new DB.ObjectID(id) }, function (err, data) {
        if (err) {
            console.log('error when find editing user', err);
        }
        res.render("userEdit.ejs", { user: data[0] });
    });
})
app.post('/doneEditUser', function(req,res){
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        console.log("=>", fields);
        if (err) {
            console.log(err);
        }
        let _id = fields._id[0];
        let password = md5(fields.password[0]);
        let auth = fields.auth[0];
        DB.update('user', { "_id": new DB.ObjectID(_id) }, {
            password:password,
            auth:auth
        }, (err, data) => {
            if (err) {
                console.log("update user err", err)
                return;
            }
            res.redirect('/userlist');
        });
    });
})
app.use(function (req, res, next) {
    console.log(url.parse(req.url).pathname);
    if (url.parse(req.url).pathname == '/userdelete'){
        console.log("called");
        if (app.locals['userinfo'].auth == 'supervisor'){
            next();
        } else {
            res.send("<script>alert('Permission denied. You have to be supervisor.'); location.href='/userlist';</script>");
        }
    }
})
app.get('/userdelete', function (req, res) {
    let id = req.query.id;
    DB.delete('user', { "_id": new DB.ObjectID(id) }, (err, data) => {
        if (!err) {
            res.send("<script>alert('User deleted.'); location.href='/userlist';</script>");
        }
    });
    // res.send("product is deleted");
})

app.listen(8001, '127.0.0.1');

