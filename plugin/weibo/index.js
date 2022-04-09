const service = require('./service')

const WHITE_LIST = [
  '热搜',
  '微博',
  '微博热搜',
  'WB',
  'RS',
  'WBRS',
  'WEIBO',
  'RESOU',
  'WEIBORESOU',
]

module.exports = options => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
      return
    }

    let [message, ...search] = data.message.toUpperCase().trim().split(/\s+/)
    if (!WHITE_LIST.includes(message)) {
      return
    }
    search = search.join(' ')

    if (data.message_type === 'group') {
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: [
          {
            type: 'reply',
            data: {
              id: data.message_id,
            },
          },
          ...(await service.getList(search, options)),
        ],
      })
      return
    }

    if (data.message_type === 'private') {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message: await service.getList(search, options),
      })
      return
    }
  }
}
