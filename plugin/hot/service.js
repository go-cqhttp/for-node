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
      table.integer('group_id').index()
      table.integer('user_id').index()
      table.integer('message_id').unique()
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

async function getTodayMessageList(group_id) {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  const messageList = await knex('message')
    .column('message')
    .where('group_id', group_id)
    .where('time', '>=', ~~(today.getTime() / 1000))
  return messageList
    .map(item => item.message.trim().toUpperCase())
    .filter(item => item)
}

async function getTop10(group_id) {
  try {
    const messageList = await getTodayMessageList(group_id)
    let wordList = segment.doSegment(messageList.join(','), {
      stripPunctuation: true
    })
    const wordTopN = {}
    wordList.forEach(item => {
      if (!wordTopN[item.w]) {
        wordTopN[item.w] = 0
      }
      wordTopN[item.w]++
    })
    wordList = Object.keys(wordTopN).reduce(
      (array, key) => [...array, { w: key, c: wordTopN[key] }],
      []
    )
    wordList.sort((a, b) => b.c - a.c)
    return [
      {
        type: 'text',
        data: {
          text: wordList
            .slice(0, 10)
            .map(item => `${item.w} ${item.c}`)
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
