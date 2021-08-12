var express = require('express');
var router = express.Router();
var DB = require('../../modules/mongodb');
var fs = require('fs');
var multiparty = require('multiparty');

router.get('/', function (req, res) {
    DB.find('product', {}, (err, data) => {
        if (err) {
            console.log('err when finding product');
            return;
        }
        res.render("admin/product/productsList.ejs", { product: data });
    });
    // res.send('product page');
})

router.get('/product-add', function (req, res) {
    res.render("admin/product/productAdd.ejs");
})

router.post('/done-product-add', function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = './upload'; //destination of picture to be uploaded. Has to be existed
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
            res.redirect('/admin/products');
        });
    });
})

router.get('/product-edit', function (req, res) {
    let id = req.query.id;
    //in order to get mongodb built-in id, need ObjectID ({"_id":new DB.ObjecyID(id)}) 
    DB.find('product', { "_id": new DB.ObjectID(id) }, function (err, data) {
        if (err) {
            console.log('error when find editing product', err);
        }
        console.log("$$$", data);
        res.render("admin/product/productEdit.ejs", { product: data[0] });
    });
})

router.post('/done-product-edit', function (req, res) {
    var form = new multiparty.Form();
    form.uploadDir = './upload';
    form.parse(req, function (err, fields, files) {
        console.log("=>", fields);
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
            res.redirect('/admin/products');
        });
    });
})

router.get('/product-delete', function (req, res) {
    let id = req.query.id;

    DB.delete('product', { "_id": new DB.ObjectID(id) }, (err, data) => {
        if (!err) {
            res.send("<script>alert('Product deleted.'); location.href='/admin/products';</script>");
        }
    });
    // res.send("product is deleted");
})

module.exports = router;