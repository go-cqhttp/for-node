const axios = require('axios')

async function getDog() {
  try {
    const { data } = await axios('https://v1.alapi.cn/api/dog?format=text')
    return data
  } catch (e) {
    console.error(e)
    return '舔不动了'
  }
}

module.exports = async ({ data, ws, http }) => {
  // 他人发送消息带有 "舔狗" 二字
  if (!data.message.includes('舔狗')) {
    return
  }

  const message = {
    type: 'text',
    data: {
      text: await getDog()
    }
  }

  // 回复消息建议用 ws.send
  // 如果需要发送命令得到返回值, 可使用 http.send
  // const res = await http.send(action, params)

  // 群消息 回复
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
        message
      ]
    })
    return
  }

  // 私聊消息 回复
  if (data.message_type === 'private') {
    ws.send('send_private_msg', {
      user_id: data.user_id,
      message: [message]
    })
    return
  }
}
