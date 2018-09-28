[![Greenkeeper badge](https://badges.greenkeeper.io/pihvi/yesql.svg)](https://travis-ci.org/pihvi/yesql) [![Known Vulnerabilities](https://snyk.io/test/npm/yesql/badge.svg)](https://snyk.io/test/npm/yesql)

### Read named SQL statements from .sql files and/or use named parameters in prepared statements.
- [Statements in .sql files](#read-named-sql-statements-from-sql-files)
- [Raw SQL / SQLite](#raw--sqlite)
- [MySQL / MariaDB](#mysql--mariadb)
- [PostgreSQL](#postgresql)

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
var sql = require('yesql')('/myproject/sql/')
var db = new sqlite3.Database('/myproject/sql/db.sqlite3')

db.all(sql.getPokemon, 1337, function(err, rows) {...})

db
  .prepare(sql.addPokemon)
  .run({name: 'pikachu', price: 99}, function(err) {...}
```

### MySQL / MariaDB
Prepared statements for MySQL / MariaDB are supported
```javascript
var sql = require('yesql')('/myproject/sql/', {type: 'mysql'})
var named = require('yesql').mysql
var mysql = require('mysql').createConnection...

// read from file
mysql.query(sql.updatePokemon({price: 5}), function(err, result) {...})

// use only named parameters
mysql.query(named('UPDATE ::ptable SET price = :price;')({price: 5, ptable: 'pokemon'}), function(err, result) {...})
```

### PostgreSQL
Prepared statements for node-postgres (pg) are supported
```javascript
var sql = require('yesql')('/myproject/sql/',  {type: 'pg'})
var named = require('yesql').pg
var pg = require('pg').connect...

// read from file
pg.query(sql.updatePokemon({price: 5}), function(err, result) {...})

// use only named parameters
pg.query(named('UPDATE pokemon SET price = :price;')({price: 5}), function(err, result) {...})
```

#### Changelog

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
