const fs = require('fs')
const path = require('path')

const readSqlFiles = (dir, options = {}) => {
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
    value.content.split('\n\n')
      .reduce((sqls, lines) => {
        if (lines.trim().startsWith('--')) {
          sqls.push(lines)
        } else if (sqls.length) {
          sqls[sqls.length - 1] += '\n\n' + lines
        }
        return sqls
      }, [])
      .forEach(sql => {
        if (sql.trim().startsWith('--')) {
          const sqlName = sql.split('\n')[0].trim().substring(2).trim()
          if (acc[sqlName]) {
            throw new Error('Duplicate SQL query name "' + sqlName + '" found, please rename other one.')
          }
          acc[sqlName] = options.type ? module.exports[options.type](sql, options) : sql
        }
      })
    return acc
  }, {})
}

const pg = (query, options = {}) => {
  return (data = {}) => {
    const matchQuoted = /('[^'\\]*(\\.[^'\\]*)*')/
    const matchDoubleQuoted = /("[^"\\]*(\\.[^"\\]*)*")/
    const values = []

    const text = query
      // remove -- comments
      .replace(/--.*$/gm, '')
      // remove /* */ comments
      .replace(/\/\*(\*(?!\/)|[^*])*\*\//g, '')
      .split(matchQuoted)
      .map(part => {
        if (!part || matchQuoted.test(part)) {
          return part
        } else {
          return part
            .split(matchDoubleQuoted)
            .map(part => {
                if (!part || matchDoubleQuoted.test(part)) {
                  return part
                } else {
                  return part.replace(/(::?)([a-zA-Z0-9_]+)/g, (_, prefix, key) => {
                    if (prefix !== ':') {
                      return prefix + key
                    } else if (key in data) {
                      values.push(data[key])
                      return '$' + values.length
                    } else if (options.useNullForMissing) {
                      values.push(null)
                      return '$' + values.length
                    } else {
                      return errorMissingValue(key, query, data)
                    }
                  })
                }
              }
            ).join('')
        }
      })
      .join('')
      .trim()
    return {
      text, values
    }
  }
}

const mysql = (query, options = {}) => {
  return (data = {}) => {
    const values = []
    return {
      sql: query.replace(/(::?)([a-zA-Z0-9_]+)/g, (_, prefix, key) => {
        if (key in data) {
          values.push(data[key])
          return prefix.replace(/:/g, '?')
        } else if (options.useNullForMissing) {
          values.push(null)
          return prefix.replace(/:/g, '?')
        } else {
          return errorMissingValue(key, query, data)
        }
      }),
      values: values
    }
  }
}

const errorMissingValue = (key, query, data) => {
  throw new Error('Missing value for statement.\n' + key + ' not provided for statement:\n' + query + '\nthis was provided:\n' + JSON.stringify(data))
}

module.exports = readSqlFiles
module.exports.pg = pg
module.exports.mysql = mysql
