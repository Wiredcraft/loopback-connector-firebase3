'use strict';

const should = require('should');
const randexp = require('randexp').randexp;

const init = require('./init');

describe('Firebase CRUD', () => {

  let ds;
  let connector;
  let Person;
  let persons;

  before((done) => {
    init.getDataSource({
      database: randexp(/^[a-z]{16}$/)
    }, (err, res) => {
      if (err) {
        return done(err);
      }
      ds = res;
      connector = ds.connector;
      Person = ds.createModel('person', {
        id: {
          type: String,
          id: true
        },
        name: String,
        age: Number
      });
      persons = [{
        id: '0',
        name: 'Charlie',
        age: 24
      }, {
        id: '1',
        name: 'Mary',
        age: 24
      }, {
        id: '2',
        name: 'David',
        age: 24
      }, {
        name: 'Jason',
        age: 44
      }];
      done();
    });
  });

  describe('Create', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    it('can create an instance with an id', () => {
      return Person.create(persons[0]).then((person) => {
        person.id.should.equal('0');
        person.name.should.equal('Charlie');
      });
    });

    it('can create an instance without an id', () => {
      return Person.create(persons[3]).then((person) => {
        person.id.should.be.String();
        person.name.should.equal('Jason');
      });
    });

    it('cannot create with a duplicate id ', () => {
      return Person.create(persons[0]).then(() => {
        throw new Error('expected an error');
      }, (err) => {
        should.exist(err);
      });
    });

    // TODO: more errors
  });

  describe('Find by ID', () => {
    let id3;

    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    before(() => {
      return Person.create(persons[3]).then((person) => {
        id3 = person.id;
      });
    });

    it('can find a saved instance', () => {
      return Person.findById('0').then((person) => {
        person.should.be.Object();
        person.id.should.equal('0');
        person.name.should.equal('Charlie');
        person.age.should.equal(24);
      });
    });

    it('can find a saved instance', () => {
      return Person.findById(id3).then((person) => {
        person.should.be.Object();
        person.id.should.equal(id3);
        person.name.should.equal('Jason');
        person.age.should.equal(44);
      });
    });

    it('cannot find an unsaved instance', () => {
      return Person.findById('1').then((res) => {
        should.not.exist(res);
      });
    });

    // TODO: more errors
  });

  describe('Destroy', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    it('can destroy a saved instance', () => {
      const person = Person(persons[0]);
      return person.remove().then((res) => {
        res.should.be.Object().with.property('count', 1);
      });
    });

    it('cannot destroy an unsaved instance', () => {
      const person = Person(persons[2]);
      return person.remove().then((res) => {
        res.should.be.Object().with.property('count', 0);
      });
    });

    // TODO: more errors
  });

  describe('Destroy by ID', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    it('can destroy a saved instance', () => {
      return Person.destroyById('0').then((res) => {
        res.should.be.Object().with.property('count', 1);
      });
    });

    it('cannot destroy an unsaved instance', () => {
      return Person.destroyById('2').then((res) => {
        res.should.be.Object().with.property('count', 0);
      });
    });

    // TODO: more errors
  });

  describe('Save', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    it('can update an instance', () => {
      return Person.findById('0').then((person) => {
        person.name = 'Charlie II';
        return person.save().then((res) => {
          res.should.be.Object();
          res.should.have.property('id', '0');
          res.should.have.property('name', 'Charlie II');
          res.should.have.property('age', 24);
        });
      });
    });

    it('can create an instance', () => {
      const person = Person(persons[1]);
      return person.save().then((res) => {
        res.should.be.Object();
        res.should.have.property('id', '1');
        res.should.have.property('name', 'Mary');
        res.should.have.property('age', 24);
      });
    });

    // TODO: more errors
  });

  describe('Replace by ID', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    it('can replace a saved instance', () => {
      return Person.replaceById('0', {
        name: 'Charlie II',
        age: 25
      }).then((res) => {
        res.should.be.Object();
        res.should.have.property('id', '0');
        res.should.have.property('name', 'Charlie II');
        res.should.have.property('age', 25);
      });
    });

    it('can replace a saved instance', () => {
      return Person.replaceById('0', {
        name: 'Charlie III'
      }).then((res) => {
        res.should.be.Object();
        res.should.have.property('id', '0');
        res.should.have.property('name', 'Charlie III');
        res.should.have.property('age', undefined);
      });
    });

    it('cannot replace an unsaved instance', () => {
      return Person.replaceById('lorem', {
        name: 'Charlie II',
        age: 25
      }).then(() => {
        throw new Error('expected an error');
      }, (err) => {
        should.exist(err);
      });
    });

    // TODO: more errors
  });

  describe('Replace or create', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    it('can replace an instance', () => {
      return Person.replaceOrCreate({
        id: '0',
        name: 'Charlie II',
        age: 25
      }).then((res) => {
        res.should.be.Object();
        res.should.have.property('id', '0');
        res.should.have.property('name', 'Charlie II');
        res.should.have.property('age', 25);
      });
    });

    it('can replace an instance', () => {
      return Person.replaceOrCreate({
        id: '0',
        name: 'Charlie III'
      }).then((res) => {
        res.should.be.Object();
        res.should.have.property('id', '0');
        res.should.have.property('name', 'Charlie III');
        res.should.have.property('age', undefined);
      });
    });

    it('can create an instance', () => {
      return Person.replaceOrCreate(persons[1]).then((res) => {
        res.should.be.Object();
        res.should.have.property('id', '1');
        res.should.have.property('name', 'Mary');
        res.should.have.property('age', 24);
      });
    });

    // TODO: more errors
  });

  describe('Find multiple', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    before(() => {
      return Person.create(persons[1]);
    });

    it('can find 2 instances', () => {
      return Person.findByIds(['0', '1']).then((res) => {
        res.should.be.Array().with.length(2);
      });
    });

    it('cannot find wrong instances', () => {
      return Person.findByIds(['0', 'lorem']).then((res) => {
        res.should.be.Array().with.length(1);
      });
    });

    it('can find 2 instances', () => {
      return Person.find({
        where: {
          id: {
            inq: ['0', '1']
          }
        }
      }).then((res) => {
        res.should.be.Array().with.length(2);
      });
    });

    it('cannot find wrong instances', () => {
      return Person.find({
        where: {
          id: {
            inq: ['0', 'lorem']
          }
        }
      }).then((res) => {
        res.should.be.Array().with.length(1);
      });
    });
  });

  describe('Destroy multiple', () => {
    after(() => {
      return connector.connect().call('remove');
    });

    before(() => {
      return Person.create(persons[0]);
    });

    before(() => {
      return Person.create(persons[1]);
    });

    it('can remove 2 instances', () => {
      return Person.remove({
        id: {
          inq: ['0', '1']
        }
      }).then((res) => {
        res.should.deepEqual({
          count: 2
        });
      });
    });

    it('cannot remove them again', () => {
      return Person.remove({
        id: {
          inq: ['0', '1']
        }
      }).then((res) => {
        res.should.deepEqual({
          count: 0
        });
      });
    });
  });

});
