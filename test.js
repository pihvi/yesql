var yesql = require('./yesql.js')

var pgPokemon = yesql.pgPreparedStatement('SELECT * from pokemon WHERE id = ${id};')
console.log(pgPokemon({id: 5}))
