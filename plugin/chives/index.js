const service = require('./service')

module.exports = options => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
      return
    }

    if (data.message_type === 'group') {
      const message = await service.handler(data)
      if (message) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message: [
            {
              type: 'reply',
              data: {
                id: data.message_id
              }
            },
            ...message
          ]
        })
      }
      return
    }

    if (data.message_type === 'private') {
      const message = await service.handler(data)
      if (message) {
        ws.send('send_private_msg', {
          user_id: data.user_id,
          message,
        })
      }
      return
    }
  }
}
