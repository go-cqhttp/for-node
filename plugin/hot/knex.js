const path = require('path')
const filename = path.join(__dirname, 'word-cloud.sqlite')
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename
  },
  useNullAsDefault: true
})

module.exports = { filename, knex }
