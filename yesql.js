var fs = require('fs')

module.exports = function readSqlFiles(dir) {
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
        acc[sqlName] = sql
      }
    })
    return acc
  }, {})
}
