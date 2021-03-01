const service = require('./service')

module.exports = options => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
      return
    }

    if (!data.message.includes('舔狗日记')) {
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
          ...(await service.getDog())
        ]
      })
      return
    }

    if (data.message_type === 'private') {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message: await service.getDog()
      })
      return
    }
  }
}
