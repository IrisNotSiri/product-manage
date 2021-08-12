var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static('staticAssets'));
app.use('/upload', express.static('upload'));

var admin = require('./router/admin');


app.use('/admin', admin);
// check if login, if no then no permission to other pages except login

app.listen(8001, '127.0.0.1');

