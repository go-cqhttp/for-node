const { invoke } = require('../el/command-manager')


module.exports = options => {
    return async({data, ws, http}) => {
        if (!data.message) return
        if (data.message_type !== 'group') return
        if (data.message[0] !== '!') return // 指令用 ! 开头
        const msg = data.message.substring(1).trim()
        const command = msg.split(' ')
        const [cmd, ...args] = command

        const actions = {
            send: async (msg) => await context_send(ws, data, msg),
            data
        }

        try {
            await invoke(actions, cmd, args)
        }catch(err){
            console.warn('执行指令时出现错误')
            console.error(err)
        }
    }
}

async function context_send(context, data, msg) {
    await context.send('send_group_msg', { // i can await a non async function
        group_id: data.group_id,
        message: [
          {
            type: 'reply',
            data: {
              id: data.message_id
            }
          },
          {
              type: 'text',
              data: { text: msg }
          }
        ]
    })
}