var yesql = require('./yesql.js')
var assert = require('assert-diff')

it('pg', function() {
  assert.deepEqual(
    yesql.pg('SELECT * from pokemon WHERE id = ${id};')({id: 5}),
    {
      text: 'SELECT * from pokemon WHERE id = $1;',
      values: [5]
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
