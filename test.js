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

it('pg bind variable with type cast', () => {
  const query = 'SELECT id::int FROM user WHERE id=:id::int and born > :year;'
  const data = {id: 1, year: 2000}
  const expected = {
    text: 'SELECT id::int FROM user WHERE id=$1::int and born > $2;',
    values: [1, 2000]
  };
  assert.deepEqual(yesql.pg(query)(data), expected)
})

it('pg bind array using ANY clause with type cast', () => {
  const query = 'SELECT id::int FROM user WHERE id=any(:idList::int[]) and born > :year;'
  const data = {idList: [1, 2, 3], year: 2000}
  const expected = {
    text: 'SELECT id::int FROM user WHERE id=any($1::int[]) and born > $2;',
    values: [[1, 2, 3], 2000]
  };
  assert.deepEqual(yesql.pg(query)(data), expected)
})

it('pg date format https://github.com/pihvi/yesql/issues/13', () => {
  const query = `select name, value, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') from table1 where created_at > :from and created_at <= :to;`
  const data = {from: new Date(0), to: new Date()}
  const expected = {
    text: `select name, value, to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') from table1 where created_at > $1 and created_at <= $2;`,
    values: [data.from, data.to]
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
      text: 'UPDATE pokemon SET price=$1;',
      values: [6]
    })
})

it('raw from file', () => {
  const sql = yesql('./')
  assert.equal(sql.updatePokemon, '-- updatePokemon\nUPDATE pokemon SET price=:price;')
  assert.equal(sql.dual, ' --dual\nselect * from dual;\n')
  let boom = sql.comments
  assert.equal(sql.comments, '-- comments\nselect\n    :foo ::INT,\n    -- TODO do not hard code this eventually\n    :bar ::INT,\n    -- TODO I suppose we are ok now\n\n    :bar::INT,\n\n    /*\n    now we are really asking for it\n    */\n    :foo ::INT')
})

it('Missing parameter throws error', () => {
  ['pg', 'mysql'].forEach(type => {
    let msg = ''
    try {
      yesql.pg('select * from persons where name=:name;')({})
    } catch (e) {
      msg = e.message
    }
    assert(msg.startsWith('Missing value for statement.\nname'))
  })
})

it('mysql with nulls for missing', () => {
  const query = 'SELECT * from pokemon WHERE id = :id and name=:name;'
  const options = {useNullForMissing: true}
  assert.deepEqual(yesql.mysql(query, options)({id: 5}), {
    sql: 'SELECT * from pokemon WHERE id = ? and name=?;',
    values: [5, null]
  })
  assert.deepEqual(yesql('./', {type: 'mysql', useNullForMissing: true}).updatePokemon({}), {
    sql: '-- updatePokemon\nUPDATE pokemon SET price=?;',
    values: [null]
  })
  assert.deepEqual(yesql('./', {type: 'mysql', useNullForMissing: true}).updatePokemon(), {
    sql: '-- updatePokemon\nUPDATE pokemon SET price=?;',
    values: [null]
  })
})

it('pg with nulls for missing', () => {
  const query = 'SELECT * from pokemon WHERE id = :id and name=:name;'
  const options = {useNullForMissing: true}
  assert.deepEqual(yesql.pg(query, options)({id: 5}), {
    text: 'SELECT * from pokemon WHERE id = $1 and name=$2;',
    values: [5, null]
  })
  assert.deepEqual(yesql('./', {type: 'pg', useNullForMissing: true}).updatePokemon({}), {
    text: 'UPDATE pokemon SET price=$1;',
    values: [null]
  })
  assert.deepEqual(yesql('./', {type: 'pg', useNullForMissing: true}).updatePokemon(), {
    text: 'UPDATE pokemon SET price=$1;',
    values: [null]
  })
})

it('pg with insert and close by placeholders', () => {
  const query = 'INSERT INTO pokemon (name, price) VALUES(:name,:price) RETURNING *';
  const res = yesql.pg(query)({name: 'pikachu', price: 1337})

  assert.deepEqual(res, {
    text: 'INSERT INTO pokemon (name, price) VALUES($1,$2) RETURNING *',
    values: ['pikachu', 1337]
  })
})

it('mysql with insert and close by placeholders', () => {
  const query = 'INSERT INTO pokemon (name, price) VALUES(:name,:price)';
  const res = yesql.mysql(query)({name: 'pikachu', price: 1337})

  assert.deepEqual(res, {
    sql: 'INSERT INTO pokemon (name, price) VALUES(?,?)',
    values: ['pikachu', 1337]
  })
})

it('PG type cast with spaces', () => {
  const query = "SELECT TO_CHAR(NOW() :: DATE, 'dd/mm/yyyy');";
  const res = yesql.pg(query)()

  assert.deepEqual(res, {
    text: "SELECT TO_CHAR(NOW() :: DATE, 'dd/mm/yyyy');",
    values: []
  })
})

it('PG to char date format', () => {
  const query = "select to_char(current_timestamp, 'Day, DD  HH12:MI:SS')";
  const res = yesql.pg(query)()

  assert.deepEqual(res, {
    text: "select to_char(current_timestamp, 'Day, DD  HH12:MI:SS')",
    values: []
  })
})

it('PG to char number format', () => {
  const query = `select to_char(:num, '"Pre:"999" Post:" .999');`;
  const res = yesql.pg(query)({num: 485.8})

  assert.deepEqual(res, {
    text: `select to_char($1, '"Pre:"999" Post:" .999');`,
    values: [485.8]
  })
})

it('PG multiple quoted strings', () => {
  const query = `select to_char(:num, '"Pre:"999" :skipthis Post:" .999'), TO_CHAR(NOW() :: DATE, 'dd/mm/yyyy') from boom WHERE pow = :pow;`;
  const res = yesql.pg(query)({num: 485.8, pow: 'kaboom'})

  assert.deepEqual(res, {
    text: `select to_char($1, '"Pre:"999" :skipthis Post:" .999'), TO_CHAR(NOW() :: DATE, 'dd/mm/yyyy') from boom WHERE pow = $2;`,
    values: [485.8, 'kaboom']
  })
})

it('PG double quoted strings with colon', () => {
  const query = 'SELECT :userid::integer as "User:Id"';
  const res = yesql.pg(query)({userid: 5})

  assert.deepEqual(res, {
    text: `SELECT $1::integer as "User:Id"`,
    values: [5]
  })
})

it('PG comments with empty lines', () => {
  const query = `
    select
      :foo ::INT[],

      /*
      now we are really asking for *it
      */
      /**
       * Really asking
       **/
      :foo ::INT[],

      -- TODO I suppose we are ok now

      :foo ::INT[]`
  const res = yesql.pg(query)({foo: 5})

  const text = `
    select
      $1 ::INT[],

      
      
      $2 ::INT[],

      

      $3 ::INT[]`.trim()
  assert.deepEqual(res, {text, values: [5, 5, 5]})
})

it('PG comments with tokens and quotes', () => {
  const query = `
    select
      :foo ::INT[],
      
      :foo ::INT[],

      
      :foo ::INT[]`
  const res = yesql.pg(query)({foo: 5})

  const text = `
    select
      $1 ::INT[],
      
      $2 ::INT[],

      
      $3 ::INT[]`.trim()
  assert.deepEqual(res, {text, values: [5, 5, 5]})
})
