const rimraf = require('rimraf')
const { filename, knex } = require('./knex')
const WordCloud = require('./word-cloud')

async function initDatabase() {
  try {
    rimraf.sync(filename)
    await knex.schema.createTable('message', table => {
      table.increments('id').primary()
      table.integer('group_id').index()
      table.integer('user_id').index()
      table.integer('message_id').unique()
      table.text('message')
      table.text('word')
      table.integer('time')
    })
    console.log('[hot]', '初始化数据库完毕')
  } catch (e) {
    console.error('[hot]', e)
  }
  process.exit(0)
}

async function saveMessage(
  { group_id, user_id, message_id, message, time },
  options
) {
  const [id] = await knex('message').insert({
    group_id,
    user_id,
    message_id,
    message,
    time,
    word: WordCloud.getWord(message, options.filterWord)
  })
  return id
}

async function getTodayWordList(group_id, user_id_list = []) {
  const today = new Date()
  today.setHours(0)
  today.setMinutes(0)
  today.setSeconds(0)
  const messageList = await knex('message')
    .column('word')
    .where('group_id', group_id)
    .whereNotIn('user_id', user_id_list)
    .where('time', '>=', ~~(today.getTime() / 1000))
  return messageList.map(item => item.word.trim()).filter(item => item)
}

async function getWordCloud(group_id, options = {}) {
  try {
    const wordList = await getTodayWordList(group_id, options.filterUserId)
    return [
      {
        type: 'image',
        data: {
          file: WordCloud.getImage(wordList)
        }
      }
    ]
  } catch (e) {
    console.error('[hot]', e)
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
