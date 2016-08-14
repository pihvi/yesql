###Read named SQL statements from .sql files

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

db.all(sql.getPokemon, 1337, function(err, rows) {...})

db
  .prepare(sql.addPokemon)
  .run({name: 'pikachu', price: 99}, function(err) {...}
```

