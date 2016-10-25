'use strict';

var Promise = require('bluebird');
var DataSource = require('loopback-datasource-juggler').DataSource;

var config = {
  serviceAccount: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PROJECT_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  },
  databaseURL: 'https://test-79702.firebaseio.com/',
  database: 'lorem'
};

exports.getDataSource = function(customConfig, callback) {
  var promise = new Promise(function(resolve, reject) {
    var db = new DataSource(require('../'), Object.assign({}, config, customConfig));
    db.log = function(a) {
      console.log(a);
    };
    db.on('connected', function() {
      resolve(db);
    });
    db.on('error', reject);
  });
  return promise.asCallback(callback);
};
