### Read named SQL statements from .sql files

Put your statements in a .sql file and name them with a comment above.
e.g. `/myproject/sql/pokemon.sql`
```sql
-- getPokemon
SELECT * from pokemon
  WHERE id = ?;

-- addPokemon
INSERT INTO pokemon(name, price)
  VALUES ($name, $price);
```

Use them in code by giving the directory where .sql files(s) are
```javascript
var sql = require('yesql')('/myproject/sql/')
var db = new sqlite3.Database('/myproject/sql/db.sqlite3')

db.all(sql.getPokemon, 1337, function(err, rows) {...})

db
  .prepare(sql.addPokemon)
  .run({name: 'pikachu', price: 99}, function(err) {...}
```

Prepared statements for node-postgres (pg) are supported
```sql
-- getPokemon
SELECT * from pokemon WHERE id = ${id};
```
```javascript
var sql = require('yesql')('/myproject/sql/', {pg: true})

client.query(sql.getPokemon({id: 5}), function(err, result) {...})
```

#### Changelog

##### 2.6.0
- Support pg prepared statements
