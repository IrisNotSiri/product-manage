const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const DB = require('../../modules/mongodb');
const bodyParser = require('body-parser');
const dateAndTime = require('date-and-time');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());


router.get('/', (req, res) => {
    //shows all active orders
    DB.sort('order', { "status": "active" }, { "orderTime": 1 }, (data) => {
        res.render("admin/order/currentOrder.ejs", { orders: data });
    });
})

router.get('/order-add', (req, res) => {
    console.log('called orderadd');
    let timeObj = new Date();
    const orderTime = dateAndTime.format(timeObj, 'YYYY/MM/DD HH:mm:ss');
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
    }, (data) => {
        res.send("<script>alert('Order created'); location.href='/admin/orders/';</script>");
    });
})

router.get('/order-history', (req, res) => {
    //check all cancelled or completed orders 
    DB.sort('order', { $or:[{"status": "complete"}, {"status": "cancel" }]}, { "orderTime": -1 }, (data) => {
        res.render("admin/order/orderHistory.ejs", { orders: data });
    });
})

router.get('/order-complete', (req, res) => {
    //change order status to complete when it's finished
    let id = req.query.id;
    DB.update('order', { "_id": new DB.ObjectID(id) }, { "status": "complete" }, (data) =>{
        res.redirect("/admin/orders/");
    });
})

router.get('/order-cancel', (req, res) => {
    let id = req.query.id;
    DB.update('order', { "_id": new DB.ObjectID(id) }, { "status": "cancel" }, (data) =>{
        res.redirect("/admin/orders/");
    });
})

module.exports = router;
