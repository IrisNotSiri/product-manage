var MongoClient = require('mongodb').MongoClient;
var dbUrl = 'mongodb://localhost:27017/';
var ObjectID = require('mongodb').ObjectID;
//database connection
function __mongoDB(callback) {
    MongoClient.connect(dbUrl, { "useUnifiedTopology": true }, (err, db) => {
        if (err) {
            console.log("err when connect mongoDB" + err);
            return;
        }
        callback(db);
    });
}
exports.ObjectID = ObjectID;
//find method; obj will be the condition of find method
exports.find = (collectionName, itemObj, callback) => {
    __mongoDB((db) => {
        let dbo = db.db('storedb');
        let result = dbo.collection(collectionName).find(itemObj);
        result.toArray(function (findErr, data) {
            db.close();
            callback(findErr, data); //process data after get data from db
        });
    });
}
//insert data to db
exports.insert = (collectionName, itemObj, callback) => {
    __mongoDB((db) => {
        let dbo = db.db('storedb');
        dbo.collection(collectionName).insertOne(itemObj,(insertError, data)=>{
            callback(insertError, data);
        });
    });
}
//update data
exports.update = (collectionName, itemObj, updateValue, callback) => {
    __mongoDB((db) => {
        let dbo = db.db('storedb');
        dbo.collection(collectionName).updateOne(itemObj,{$set:updateValue},(updateError, data)=>{
            callback(updateError, data);
        });
    });
}

//delete data
exports.delete = (collectionName, itemObj, callback) => {
    __mongoDB((db) => {
        let dbo = db.db('storedb');
        dbo.collection(collectionName).deleteOne(itemObj,(deleteError, data)=>{
            callback(deleteError, data);
        });
    });
}

exports.sort = (collectionName, findObj, conditionObj, callback) => {
    __mongoDB((db) => {
        let dbo = db.db('storedb');
        //conditionObj = { "sortBythisColomn": 1} => 1: ascending, -1: descending
        let result = dbo.collection(collectionName).find(findObj).sort(conditionObj);
        result.toArray(function (findErr, data) {
            db.close();
            callback(findErr, data); //process data after get data from db
        });
    });
}