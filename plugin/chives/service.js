const rimraf = require('rimraf')
const axios = require('axios')
const { filename, knex } = require('./knex')
const { getCenter } = require('./util')

const detailCache = new Map()
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'

async function initDatabase() {
  try {
    rimraf.sync(filename)

    await knex.schema.createTable('chives', table => {
      table.increments('id').primary()
      table.integer('user_id').index()
      table.string('fund_code')
      table.dateTime('created_at')
    })

    console.log('[chives]', '初始化数据库完毕')
  } catch (e) {
    console.error('[chives]', e)
  }
  process.exit(0)
}

async function handler({ user_id, message }) {
  const [key = '', operator = '', code = ''] = message.trim().split(/\s+/)
  if (!['韭菜', '暴富', 'JC', 'BF'].includes(key.toUpperCase())) {
    return
  }

  if (!operator && !code) {
    return await getFundList(user_id)
  }

  if (['添加', '增加', 'ADD', '加'].includes(operator.toUpperCase())) {
    return await addFund(user_id, code)
  }

  if (
    ['删除', '移除', '删', 'REMOVE', 'DELETE', 'DEL'].includes(
      operator.toUpperCase()
    )
  ) {
    return await removeFund(user_id, code)
  }
}

async function removeFund(user_id, code) {
  const effectCount = await knex('chives')
    .where({
      user_id,
      fund_code: code,
    })
    .del()
  if (!effectCount) {
    return [
      {
        type: 'text',
        data: {
          text: '删除基金失败',
        },
      },
    ]
  }
  return [
    {
      type: 'text',
      data: {
        text: '删除基金成功',
      },
    },
  ]
}

async function addFund(user_id, code) {
  const detail = await getFundDetail(code)
  if (!detail) {
    return [
      {
        type: 'text',
        data: {
          text: '添加基金失败',
        },
      },
    ]
  }
  const [{ has }] = await knex('chives')
    .where({
      user_id,
      fund_code: code,
    })
    .count('id as has')
  if (has) {
    return [
      {
        type: 'text',
        data: {
          text: '已存在该基金',
        },
      },
    ]
  }
  await knex('chives').insert({
    user_id,
    fund_code: code,
    created_at: new Date(),
  })
  return [
    {
      type: 'text',
      data: {
        text: ['添加基金成功', formatFund(detail)].join('\n'),
      },
    },
  ]
}

function formatFund(item) {
  return `${item.fundcode} ${item.gszzl > 0 ? '+' : ''}${item.gszzl} ${
    item.name
  }`
}

async function getFundList(user_id) {
  const list = await Promise.all(
    (await knex('chives').column('fund_code').where('user_id', user_id))
      .map(chives => chives.fund_code)
      .map(getFundDetail)
  )
  list.sort((a, b) => b.gszzl - a.gszzl)
  return [
    {
      type: 'text',
      data: {
        text: list.map(formatFund).join('\n') || '您还不是韭菜, 快来添加基金吧\n韭菜/JC/暴富/BF 添加/ADD/删除/DEL 基金代码',
      },
    },
  ]
}

async function getFundDetail(code) {
  try {
    const cache = detailCache.get(code)
    if (cache && Date.now() - cache.time < 1000 * 60) {
      return cache.data
    }

    let { data } = await axios({
      url: `http://fundgz.1234567.com.cn/js/${code}.js`,
      timeout: 5000,
      headers: {
        'user-agent': USER_AGENT,
      },
    })

    data = getCenter(data, 'jsonpgz(', ');')
    if (!data) {
      return null
    }

    data = JSON.parse(data)
    if (new Date() - new Date(data.jzrq) > 1000 * 60 * 60 * 24 * 14) {
      return null
    }

    detailCache.set(code, { time: Date.now(), data })
    return data
  } catch (e) {
    console.error('[chives]', e)
    return null
  }
}

module.exports = {
  initDatabase,
  handler,
}
