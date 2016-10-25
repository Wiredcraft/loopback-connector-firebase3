'use strict';

require('should');

const randexp = require('randexp').randexp;

const init = require('./init');

describe('CouchDB connector', () => {

  let ds;
  let connector;

  it('can connect', (done) => {
    init.getDataSource({
      database: randexp(/^[a-z]{16}$/)
    }, (err, res) => {
      if (err) {
        return done(err);
      }
      res.should.be.Object();
      res.should.have.property('connected', true);
      res.should.have.property('connector').which.is.Object();
      ds = res;
      connector = res.connector;
      done();
    });
  });

  it('can connect', (done) => {
    connector.connect((err, res) => {
      if (err) {
        return done(err);
      }
      res.should.be.Object();
      res.should.have.property('once').which.is.Function();
      res.should.have.property('key').which.is.String();
      done();
    });
  });

  it('can disconnect', (done) => {
    ds.disconnect(done);
  });

  it('can disconnect', (done) => {
    connector.disconnect((err, res) => {
      if (err) {
        return done(err);
      }
      res.should.equal(true);
      done();
    });
  });

  it('can connect twice the same time', (done) => {
    connector.connect();
    connector.connect(done);
  });

  it('can disconnect twice the same time', (done) => {
    connector.disconnect();
    connector.disconnect(done);
  });

  it('can connect and disconnect', (done) => {
    connector.connect();
    connector.disconnect(done);
  });

});
