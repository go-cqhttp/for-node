const path = require('path')
const filename = path.join(__dirname, 'db.sqlite')
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename
  },
  useNullAsDefault: true
})

module.exports = { filename, knex }
