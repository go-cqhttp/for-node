const rimraf = require('rimraf')
const path = require('path')
const Segment = require('segment')
const _ = require('lodash')
const filename = path.join(__dirname, 'word-cloud.sqlite')
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename
  },
  useNullAsDefault: true
})
const segment = new Segment()
segment.useDefault()

async function initDatabase() {
  try {
    rimraf.sync(filename)
    await knex.schema.createTable('message', table => {
      table.increments('id').primary()
      table.integer('group_id')
      table.integer('user_id')
      table.integer('message_id')
      table.text('message')
      table.integer('time')
    })
    console.log('[word-cloud]', '初始化数据库完毕')
  } catch (e) {
    console.error('[word-cloud]', e)
  }
  process.exit(0)
}

async function saveMessage({ group_id, user_id, message_id, message, time }) {
  const [id] = await knex('message').insert({
    group_id,
    user_id,
    message_id,
    message,
    time
  })
  return id
}

async function getTodayMessageList() {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  const messageList = await knex('message')
    .column('message')
    .where('time', '>=', ~~(today.getTime() / 1000))
  return messageList
    .map(item => item.message.trim().toUpperCase())
    .filter(item => item)
}

async function getTop10() {
  try {
    const messageList = await getTodayMessageList()
    let wordList = segment.doSegment(messageList.join(','), {
      stripPunctuation: true
    })
    wordList = _.uniqBy(wordList, 'w')
    wordList.forEach(item => (item.p = item.p || 0))
    wordList.sort((a, b) => b.p - a.p)
    return [
      {
        type: 'text',
        data: {
          text: wordList
            .slice(0, 10)
            .map((item, index) => `${index + 1} ${item.w}`)
            .join('\n')
        }
      }
    ]
  } catch (e) {
    console.error('[word-cloud]', e)
    return [
      {
        type: 'text',
        data: {
          text: e.message
        }
      }
    ]
  }
}

module.exports = {
  initDatabase,
  saveMessage,
  getTop10
}
