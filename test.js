var yesql = require('./yesql.js')

var pgPokemon = yesql.pg('SELECT * from pokemon WHERE id = ${id};')
console.log(pgPokemon({id: 5}))

var mysqlPokemon = yesql.mysql('SELECT * from ::ptable WHERE id = :id;')
console.log(mysqlPokemon({id: 5, ptable: 'pokemon'}))
