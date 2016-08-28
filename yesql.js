var fs = require('fs')

module.exports.pgPreparedStatement = pg
module.exports = function readSqlFiles(dir, options) {
  var opts = options ? options : {pg: false}
  return fs.readdirSync(dir).filter(function(file) {
    return file.endsWith('.sql')
  }).map(function(file) {
    return {
      name: file,
      content: fs.readFileSync(dir + file, 'utf8')
    }
  }).reduce(function(acc, value) {
    acc[value.name] = value.content
    value.content.split('\n\n').forEach(function(sql) {
      if (sql.startsWith('-- ')) {
        var sqlName = sql.split('\n')[0].substring(2).trim()
        acc[sqlName] = opts.pg ? pg(sql) : sql
      }
    })
    return acc
  }, {})
}

function pg(query) {
  return function(data) {
    var values = []
    return {
      text: query.replace(/\${(.+?)}/g, function(_, key) {
        if (key in data) {
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
