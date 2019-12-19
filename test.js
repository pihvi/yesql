const yesql = require('./yesql.js')
const assert = require('assert-diff')

it('pg simple one parameter', () => {
  assert.deepEqual(
    yesql.pg('SELECT * from pokemon WHERE id = :id;')({id: 5}),
    {
      text: 'SELECT * from pokemon WHERE id = $1;',
      values: [5]
    })
})

it('pg type cast with multiple parameters', () => {
  const query = 'SELECT id::int FROM user WHERE id=:id and born > :year;'
  const data = {id: '5', year: 2000}
  const expected = {
    text: 'SELECT id::int FROM user WHERE id=$1 and born > $2;',
    values: ['5', 2000]
  };
  assert.deepEqual(yesql.pg(query)(data), expected)
})

it('mysql', () => {
  assert.deepEqual(
    yesql.mysql('SELECT * from ::ptable WHERE id = :id;')({id: 5, ptable: 'pokemon'}),
    {
      sql: 'SELECT * from ?? WHERE id = ?;',
      values: ['pokemon', 5]
    })
})

it('mysql from file', () => {
  const sql = yesql('./', {type: 'mysql'})
  assert.deepEqual(
    sql.updatePokemon({price: 6}),
    {
      sql: '-- updatePokemon\nUPDATE pokemon SET price=?;',
      values: [6]
    })
})

it('pg from file', () => {
  const sql = yesql('./', {type: 'pg'})
  assert.deepEqual(
    sql.updatePokemon({price: 6}),
    {
      text: '-- updatePokemon\nUPDATE pokemon SET price=$1;',
      values: [6]
    })
})

it('raw from file', () => {
  const sql = yesql('./')
  assert.equal(sql.updatePokemon, '-- updatePokemon\nUPDATE pokemon SET price=:price;')
  assert.equal(sql.dual, ' --dual\nselect * from dual;\n')
})
