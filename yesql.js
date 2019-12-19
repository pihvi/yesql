const fs = require('fs')
const path = require('path')

const readSqlFiles = (dir, options) => {
  const opts = options ? options : {pg: false}
  return fs.readdirSync(dir).filter(file => {
    return file.endsWith('.sql')
  }).map(file => {
    return {
      name: file,
      content: fs
        .readFileSync(path.resolve(dir, file), 'utf8')
        .replace(/\r\n/g, '\n')
    }
  }).reduce((acc, value) => {
    acc[value.name] = value.content
    value.content.split('\n\n').forEach(sql => {
      if (sql.trim().startsWith('--')) {
        const sqlName = sql.split('\n')[0].trim().substring(2).trim()
        acc[sqlName] = opts.type ? module.exports[opts.type](sql) : sql
      }
    })
    return acc
  }, {})
}

const pg = query => {
  return data => {
    const values = []
    return {
      text: query.replace(/(::?)([a-zA-Z0-9_]+)/g, (_, prefix, key) => {
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

const mysql = query => {
  return data => {
    const values = []
    return {
      sql: query.replace(/(::?)([a-zA-Z0-9_]+)/g, (_, prefix, key) => {
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

module.exports = readSqlFiles
module.exports.pg = pg
module.exports.mysql = mysql
