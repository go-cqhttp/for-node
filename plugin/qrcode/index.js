const service = require('./service')

const pattern = /^(二维码|qr(code)?)\s+/i

module.exports = options => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
      return
    }

    let message = data.message.trim()
    if (!pattern.test(message)) {
      return
    }

    message = message.replace(pattern, '').trim()
    if (!message) {
      return
    }

    if (data.message_type === 'group') {
      ws.send('send_group_msg', {
        group_id: data.group_id,
        message: [
          {
            type: 'reply',
            data: {
              id: data.message_id
            }
          },
          ...(await service.getImage(message))
        ]
      })
      return
    }

    if (data.message_type === 'private') {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message: await service.getImage(message)
      })
      return
    }
  }
}
