const rimraf = require('rimraf')
const Segment = require('segment')
const { filename, knex } = require('./knex')
const { createWordCloud } = require('./word-cloud')

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

async function getWordCloud(group_id) {
  try {
    const messageList = await getTodayMessageList(group_id)
    const wordList = segment.doSegment(messageList.join(','), {
      stripPunctuation: true
    })
    return [
      {
        type: 'image',
        data: {
          file: createWordCloud(wordList.map(item => item.w))
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
  getWordCloud
}
