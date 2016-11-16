var yesql = require('./yesql.js')
var assert = require('assert-diff')

it('pg', function() {
  assert.deepEqual(
    yesql.pg('SELECT * from pokemon WHERE id = :id;')({id: 5}),
    {
      text: 'SELECT * from pokemon WHERE id = $1;',
      values: [5]
    })
})

it('pg type cast', function() {
  assert.deepEqual(
    yesql.pg('SELECT id::int FROM user WHERE id=:id;')({id: '5'}),
    {
      text: 'SELECT id::int FROM user WHERE id=$1;',
      values: ['5']
    })
})

it('mysql', function() {
  assert.deepEqual(
    yesql.mysql('SELECT * from ::ptable WHERE id = :id;')({id: 5, ptable: 'pokemon'}),
    {
      sql: 'SELECT * from ?? WHERE id = ?;',
      values: ['pokemon', 5]
    })
})

it('mysql from file', function() {
  var sql = yesql('./', {type: 'mysql'})
  assert.deepEqual(
    sql.updatePokemon({price: 6}),
    {
      sql: '-- updatePokemon\nUPDATE pokemon SET price=?;\n',
      values: [6]
    })
})

it('pg from file', function() {
  var sql = yesql('./', {type: 'pg'})
  assert.deepEqual(
    sql.updatePokemon({price: 6}),
    {
      text: '-- updatePokemon\nUPDATE pokemon SET price=$1;\n',
      values: [6]
    })
})

it('raw from file', function() {
  var sql = yesql('./')
  assert.equal(sql.updatePokemon, '-- updatePokemon\nUPDATE pokemon SET price=:price;\n')
})
