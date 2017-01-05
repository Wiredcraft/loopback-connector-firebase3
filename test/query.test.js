'use strict';

require('should');
const randexp = require('randexp').randexp;

const init = require('./init');

describe.only('Firebase Query', () => {
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
      Promise.all(persons.map(person => Person.create(person)))
        .then(() => done());
    });
  });

  after(() => {
    return connector.connect().call('remove');
  });

  it('should support "where" and return filtered array data by find keywords', () => {
    return Person.find({ where: { name: 'Jason' } })
      .then(persons => {
        persons.should.be.Array();
        persons[0].name.should.equal('Jason');
      });
  });
});
