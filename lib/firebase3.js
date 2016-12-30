'use strict';

/*!
 * Module dependencies
 */
// const debug = require('debug')('loopback:connector:firebase3');

const firebase = require('firebase-admin');
const httpError = require('http-errors');
const Promise = require('bluebird');

const NoSQL = require('loopback-connector-nosql');
const Accessor = NoSQL.Accessor;

/**
 * The constructor for Firebase connector
 *
 * @param {Object} settings The settings object
 * @param {DataSource} dataSource The data source instance
 * @constructor
 */
class Firebase extends NoSQL {

  /**
   * ID type.
   */
  getDefaultIdType(prop) {
    return String;
  }

  /**
   * Connect to Firebase
   */
  _connect(settings, database) {
    if (!database) {
      throw new Error('Database name must be specified in dataSource for Firebase connector');
    }
    // @see https://firebase.google.com/docs/reference/node/firebase#.initializeApp
    // TODO: better app name?
    this._app = firebase.initializeApp({
      credential: firebase.credential.cert(settings.serviceAccount),
      databaseURL: settings.databaseURL
    });
    this._db = this._app.database();
    return this._db.ref(database);
  }

  /**
   * Disconnect from Firebase
   */
  _disconnect() {
    // Cleanup.
    this._db.goOffline();
    this._db = null;
    const promise = this._app.delete();
    this._app = null;
    return promise;
  }

  /**
   * Operation hooks.
   */

  /**
   * Implement `autoupdate()`.
   *
   * @see `DataSource.prototype.autoupdate()`
   */
  // autoupdate(models, callback) {}

  /**
   * Implement `automigrate()`.
   *
   * @see `DataSource.prototype.automigrate()`
   */
  // automigrate(models, callback) {}

}

/**
 * Implement Accessor.
 */
class FirebaseAccessor extends Accessor {

  /**
   * Save data to DB without a given id.
   *
   * Result is a promise with `[id, rev]` or an error.
   */
  postWithoutId(data, options) {
    return this.connection.call('push', data).then(function(ref) {
      return [ref.key, null];
    });
  }

  /**
   * Save data to DB with a given id.
   *
   * Result is a promise with `[id, rev]` or an error.
   */
  postWithId(id, data, options) {
    // Transactions maybe better but unfortunately we cannot use it to remove data and we need to keep
    // consistency.
    return this.exists(id, options).then((exists) => {
      if (exists) {
        return Promise.reject(httpError(409, 'Conflict: duplicate id'));
      }
      return this.connection.call('child', id).call('set', data);
    }).return([id, null]);
  }

  /**
   * Save data to DB with a given id.
   *
   * Result is a promise with `[id, rev]` or an error.
   */
  putWithId(id, data, options) {
    // Transactions maybe better but unfortunately we cannot use it to remove data and we need to keep
    // consistency.
    return this.exists(id, options).then((exists) => {
      if (!exists) {
        return Promise.reject(httpError(404));
      }
      return this.connection.call('child', id).call('set', data);
    }).return([id, null]);
  }

  /**
   * Destroy data from DB by id.
   *
   * Result is a promise with whatever or an error.
   */
  destroyById(id, options) {
    return this.exists(id, options).then((exists) => {
      if (!exists) {
        return Promise.reject(httpError(404));
      }
      return this.connection.call('child', id).call('remove');
    }).return(true).catchReturn(false);
  }

  /**
   * Find data from DB by id.
   *
   * Result is a promise with the data or an error.
   */
  findById(id, options) {
    return this.connection.call('child', id).call('once', 'value').call('val').then((data) => {
      if (data == null) {
        return Promise.reject(httpError(404));
      }
      return data;
    });
  }

  /**
   * Find all data from DB for a model.
   *
   * Result is a promise with an array of 0 to many `[id, data]`.
   */
  findAll(options) {
    return this.connection.call('once', 'value').then((snapshot) => {
      let res = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (data != null) {
          res.push([child.key, child.val()]);
        }
      });
    });
  }

  /**
   * Helper.
   */
  exists(key, options) {
    return this.connection.call('child', key).call('once', 'value').call('exists');
  }

  /**
   * Convert data from model to DB format.
   */
  forDb(data) {
    data = super.forDb(data);
    // Save the model name.
    data._type = this.modelName;
    return data;
  }

  /**
   * Convert data from DB format to model.
   */
  fromDb(data) {
    data = super.fromDb(data);
    // Remove DB only data.
    if (data._type != null) {
      delete data._type;
    }
    return data;
  }

}

// Export initializer.
exports.initialize = NoSQL.initializer('firebase3', Firebase, FirebaseAccessor);

// Export classes.
exports.Firebase = Firebase;
exports.FirebaseAccessor = FirebaseAccessor;
