const service = require('./service')

module.exports = options => {
  return async ({ data, ws, http }) => {
    // 非本人撤回 (一般是管理员撤回的), 不复读
    if (data.operator_id !== data.user_id) {
      return
    }

    if (data.notice_type === 'group_recall') {
      const message = await service.getRecall(http, data.message_id)
      if (message) {
        ws.send('send_group_msg', {
          group_id: data.group_id,
          message,
        })
      }
      return
    }

    if (data.notice_type === 'friend_recall') {
      const message = await service.getRecall(http, data.message_id)
      if (message) {
        ws.send('send_private_msg', {
          user_id: data.user_id,
          message,
        })
      }
    }
  }
}
