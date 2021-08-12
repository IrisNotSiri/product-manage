var express = require('express');
var router = express.Router();
var crypto = require("crypto");
var DB = require('../../modules/mongodb');
var bodyParser = require('body-parser');
var dateAndTime = require('date-and-time');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.get('/', (req, res) => {
    //shows all active orders
    DB.sort('order', { "status": "active" }, { "orderTime": 1 }, (err, data) => {
        if (err) {
            console.log('err when finding all new orders');
            return;
        }
        // console.log(data[0]);
        // detail = JSON.parse(data[0].orderDetail);
        // detail.forEach(item => {
        //     console.log("items in array",item);
        // })
        res.render("admin/order/currentOrder.ejs", { orders: data });
    });
})

router.get('/order-add', (req, res) => {
    console.log('called orderadd');
    let timeObj = new Date();
    const orderTime = dateAndTime.format(timeObj, 'YYYY/MM/DD HH:mm:ss');
    // let today = timeObj.toString();
    // let h = timeObj.getHours();
    // let m = timeObj.getMinutes();
    // let s = timeObj.getSeconds();
    // let time = h + ":" + m + ":" + s;
    crypto.randomInt(99999, 1000000, (err, n) => {
        if (err) throw err;
        console.log(n);
        res.render("admin/order/orderAdd.ejs", { orderNum: n, orderTime: orderTime });
    });

})

router.post('/done-order-add', (req, res) => {
    // console.log("look at here@!@", req.body.orderDetail);
    let orderNum = req.body.orderNum;
    let orderDetail = req.body.orderDetail;
    let totalItem = req.body.totalItem;
    let totalPrice = req.body.totalPrice;
    let customerName = req.body.customerName;
    let phoNum = req.body.phoNum;
    let note = req.body.note;
    let orderTime = req.body.orderTime;
    let status = "active";
    DB.insert('order', {
        orderNum: orderNum,
        orderDetail: orderDetail,
        totalItem: totalItem,
        totalPrice: totalPrice,
        customerName: customerName,
        phoNum: phoNum,
        note: note,
        time: time,
        orderTime: orderTime,
        status: status
    }, (err, data) => {
        if (err) {
            console.log('err when create new user', err);
            return;
        }
        res.send("<script>alert('Order created'); location.href='/admin/orders/';</script>");
    })
    // res.render("admin/order/orderHistory.ejs", {  });
})

router.get('/order-history', (req, res) => {
    //check all cancelled or completed orders 
    DB.sort('order', { $or:[{"status": "complete"}, {"status": "cancel" }]}, { "orderTime": -1 }, (err, data) => {
        if (err) {
            console.log('err when finding all completed orders');
            return;
        }
        // console.log('@@@@@completed orders', data);
        res.render("admin/order/orderHistory.ejs", { orders: data });
    });
})

router.get('/order-complete', (req, res) => {
    //change order status to complete when it's finished
    let id = req.query.id;
    DB.update('order', { "_id": new DB.ObjectID(id) }, { "status": "complete" }, function (err, data) {
        if (err) {
            console.log('error when complete order', err);
        }
        res.redirect("/admin/orders/");
    });
})


router.get('/order-cancel', (req, res) => {
    let id = req.query.id;
    DB.update('order', { "_id": new DB.ObjectID(id) }, { "status": "cancel" }, function (err, data) {
        if (err) {
            console.log('error when cancel order', err);
        }
        res.redirect("/admin/orders/");
    });
})

module.exports = router;