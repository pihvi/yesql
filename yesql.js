var fs = require('fs')

module.exports = function readSqlFiles(dir, options) {
  var opts = options ? options : {pg: false}
  return fs.readdirSync(dir).filter(function(file) {
    return file.endsWith('.sql')
  }).map(function(file) {
    return {
      name: file,
      content: fs
        .readFileSync(dir + file, 'utf8')
        .replace(/\r\n/g, '\n')
    }
  }).reduce(function(acc, value) {
    acc[value.name] = value.content
    value.content.split('\n\n').forEach(function(sql) {
      if (sql.startsWith('-- ')) {
        var sqlName = sql.split('\n')[0].substring(2).trim()
        acc[sqlName] = opts.type ? module.exports[opts.type](sql) : sql
      }
    })
    return acc
  }, {})
}
module.exports.pg = pg
module.exports.mysql = mysql

function pg(query) {
  return function(data) {
    var values = []
    return {
      text: query.replace(/(::?)([a-zA-Z0-9_]+)/g, function(_, prefix, key) {
        if (prefix !== ':') {
          return prefix + key
        } else if (key in data) {
          values.push(data[key])
          return '$' + values.length
        } else {
          throw new Error('Missing value for statement.\n' + key + ' not provided for statement:\n' + query + '\nthis was provided:\n' + JSON.stringify(data))
        }
      }),
      values: values
    }
  }
}

function mysql(query) {
  return function(data) {
    var values = []
    return {
      sql: query.replace(/(::?)([a-zA-Z0-9_]+)/g, function(_, prefix, key) {
        if (key in data) {
          values.push(data[key])
          return prefix.replace(/:/g, '?')
        } else {
          throw new Error('Missing value for statement.\n' + key + ' not provided for statement:\n' + query + '\nthis was provided:\n' + JSON.stringify(data))
        }
      }),
      values: values
    }
  }
}
