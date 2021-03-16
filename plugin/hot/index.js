const service = require('./service')

const WHITE_LIST = ['RM', '热门', 'HOT']

module.exports = options => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
      return
    }

    // 只记录群消息
    if (data.message_type !== 'group') {
      return
    }

    // 不要 await, 默默记录即可
    service.saveMessage(data, options)

    const message = data.message.toUpperCase().trim()
    if (!WHITE_LIST.includes(message)) {
      return
    }

    ws.send('send_group_msg', {
      group_id: data.group_id,
      message: [
        {
          type: 'reply',
          data: {
            id: data.message_id
          }
        },
        ...(await service.getWordCloud(data.group_id, options))
      ]
    })
  }
}
