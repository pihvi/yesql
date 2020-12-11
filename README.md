[![Greenkeeper badge](https://badges.greenkeeper.io/pihvi/yesql.svg)](https://travis-ci.org/pihvi/yesql) [![Known Vulnerabilities](https://snyk.io/test/npm/yesql/badge.svg)](https://snyk.io/test/npm/yesql)

### Read named SQL statements from .sql files and/or use named parameters in prepared statements.
- [Statements in .sql files](#read-named-sql-statements-from-sql-files)
- [Raw SQL / SQLite](#raw--sqlite)
- [MySQL / MariaDB](#mysql--mariadb)
- [PostgreSQL](#postgresql)
- [Handling missing parameters](#handling-missing-parameters)

### Read named SQL statements from .sql files
Put your statements in a .sql file and name them with a comment above.
e.g. `/myproject/sql/pokemon.sql`
```sql
-- getPokemon
SELECT * from pokemon
  WHERE id = ?; -- raw style

-- addPokemon
INSERT INTO pokemon(name, price)
  VALUES ($name, $price); -- SQLite named parameter style

-- updatePokemon
UPDATE pokemon
  SET price = :price; -- PostgreSQL / MySQL named parameter style
```

### Raw / SQLite
Use them in code by giving the directory where .sql files(s) are
```javascript
const sql = require('yesql')('/myproject/sql/')
const db = new sqlite3.Database('/myproject/sql/db.sqlite3')

db.all(sql.getPokemon, 1337, (err, rows) => {...})

db
  .prepare(sql.addPokemon)
  .run({name: 'pikachu', price: 99}, err => {...}
```

### MySQL / MariaDB
Prepared statements for MySQL / MariaDB are supported
```javascript
const sql = require('yesql')('/myproject/sql/', {type: 'mysql'})
const named = require('yesql').mysql
const mysql = require('mysql').createConnection...

// read from file
mysql.query(sql.updatePokemon({price: 5}), (err, result) => {...})

// use only named parameters
mysql.query(named('UPDATE ::ptable SET price = :price;')({price: 5, ptable: 'pokemon'}), (err, result) => {...})
```

### PostgreSQL
Prepared statements for node-postgres (pg) are supported
```javascript
const sql = require('yesql')('/myproject/sql/',  {type: 'pg'})
const named = require('yesql').pg
const pg = require('pg').connect...

// read from file
pg.query(sql.updatePokemon({price: 5}), (err, result) => {...})

// use only named parameters
pg.query(named('UPDATE pokemon SET price = :price;')({price: 5}), (err, result) => {...})
```

### Handling missing parameters
By default MySQL and PG versions throw an error if a parameter is not given.
Passing a flag "useNullForMissing" a null value is used instead.
Example only for PG, but works for MySQL also.
```javascript
const sql = require('yesql')('/myproject/sql/',  {type: 'pg', useNullForMissing: true})
const named = require('yesql').pg
const pg = require('pg').connect...

// read from file and insert null values for missing parameters (price)
pg.query(sql.updatePokemon(), (err, result) => {...})

// use only named parameters with nulls for missing values
pg.query(named('UPDATE pokemon SET price = :price;', {useNullForMissing: true})({}), (err, result) => {...})
```

#### Changelog

##### 5.0.0
- Fail fast on duplicate SQL query name
- Thanks @asafyish https://github.com/pihvi/yesql/pull/26
- Support comments in PG
- Thanks @dwelch2344 https://github.com/pihvi/yesql/pull/23

##### 4.1.3
- Support fully double quoted strings
- thanks @AcerLaurinum  https://github.com/pihvi/yesql/issues/22

##### 4.1.2
- Support fully quoted strings
- Fix regression, thanks @besk-cerity https://github.com/pihvi/yesql/issues/18

##### 4.1.1
- Fix close by parameter names in PG
- Thanks @rockdriven https://github.com/pihvi/yesql/issues/14

##### 4.1.0
- With "useNullForMissing" flag enabled, use null for missing parameter
- Thanks @dwelch2344 https://github.com/pihvi/yesql/pull/10

##### 4.0.0
- Moderner JS with arrow functions and consts
- Support PG date format function
- Thanks @ericxinzhang https://github.com/pihvi/yesql/issues/13

##### 3.2.2
- Allow missing slash on directory path
- Thanks @critocrito https://github.com/pihvi/yesql/pull/9

##### 3.2.1
- Add security build and badge
- Update deps

##### 3.2.0
- Support Windows new lines

##### 3.1.6
- Add CI build and Greenkeeper check
- Update dev dependencies

##### 3.1.5
- Add MySQL table name as parameter to example

##### 3.1.4
- Fix pg type cast and docs

##### 3.1.1
- Support mysql prepared statements

##### 2.6.0
- Support pg prepared statements
