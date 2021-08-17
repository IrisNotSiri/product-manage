const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://localhost:27017/';
const ObjectID = require('mongodb').ObjectID;
exports.ObjectID = ObjectID;
//database connection

/*method1: 
if convert a node-like callback((err, data)) to promise
const util = require('util');
const mongoDBConnectPromise = util.promisify(MongoClient.connect);
*/
//method2: write your own
//MongoClient.connect returns promise if no callback passed

exports.find = (collectionName, itemObj, callback) => {
    MongoClient.connect(dbUrl, { "useUnifiedTopology": true })
        .then(db => {
            let dbo = db.db('storedb');
            let result = dbo.collection(collectionName).find(itemObj);
            return new Promise((resolve, reject) => {
                result.toArray((findErr, data) => {
                    db.close();
                    // console.log(data);
                    if (findErr) reject(findErr);
                    resolve(data);
                });
            })
        }).then(data => {
            callback(data);
        }).catch(err=>{console.log('err when find data', err)});
}

//insert data to db
exports.insert = (collectionName, itemObj, callback) => {
    MongoClient.connect(dbUrl, { "useUnifiedTopology": true })
    .then((db) => {
        let dbo = db.db('storedb');
        return new Promise((resolve, reject) => {
            dbo.collection(collectionName).insertOne(itemObj, (insertError, data) => {
                db.close();
                if (insertError) reject(insertError);
                resolve(data);
            });
        })
    }).then (data => {
        callback(data);
    }).catch(err => { console.log('err when insert data', err)});
}
//update data
exports.update = (collectionName, itemObj, updateValue, callback) => {
    MongoClient.connect(dbUrl, { "useUnifiedTopology": true })
    .then((db) => {
        let dbo = db.db('storedb');
        return new Promise((resolve, reject) => {
            dbo.collection(collectionName).updateOne(itemObj, { $set: updateValue },(updateError, data) => {
                db.close();
                if (updateError) reject(updateError);
                resolve(data);
            });
        })
    }).then (data => {
        callback(data);
    }).catch(err => { console.log('err when update data', err)});
}

//delete data
exports.delete = (collectionName, itemObj, callback) => {
    MongoClient.connect(dbUrl, { "useUnifiedTopology": true })
    .then((db) => {
        let dbo = db.db('storedb');
        return new Promise((resolve, reject) => {
            dbo.collection(collectionName).deleteOne(itemObj, (deleteError, data) => {
                db.close();
                if (deleteError) reject(deleteError);
                resolve(data);
            });
        })
    }).then (data => {
        callback(data);
    }).catch(err => { console.log('err when delete data', err)});
}

exports.sort = (collectionName, findObj, conditionObj, callback) => {
    MongoClient.connect(dbUrl, { "useUnifiedTopology": true })
    .then((db) => {
        let dbo = db.db('storedb');
        let result = dbo.collection(collectionName).find(findObj).sort(conditionObj);
        return new Promise((resolve, reject) => {
            result.toArray( (findErr, data) => {
                db.close();
                if (findErr) reject(findErr);
                resolve(data);
            });
        })
    }).then (data => {
        callback(data);
    }).catch(err => { console.log('err when sort data', err)});
}
