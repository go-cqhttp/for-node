const { invoke } = require('../el/command-manager')
const { owners } = require('../data/settings.json')
const { commands } = require('../config')

module.exports = options => {
    return async({data, ws, http}) => {
        if (!data.message) return false
        if (data.message[0] !== '!') return false // 指令用 ! 开头
        if (data.message_type === 'group') {
            const isAdmin = data.sender.role === 'admin'
            const insideOwners = owners && data.sender.user_id in owners
            if (!isAdmin && !insideOwners){
                // maybe say something for no permission
                console.log(`用户 ${data.sender.nickname} 没有权限去执行指令，已略过`)
                return // no permission
            }

            const msg = data.message.substring(1).trim()
            const command = msg.split(' ')
            const [cmd, ...args] = command

            const actions = {
                send: async (msg) => await context_send(ws, data, msg),
                data,
                commands
            }

            try {
                return await invoke(actions, cmd, args)
            }catch(err){
                console.warn('执行指令时出现错误')
                console.error(err)
                return false
            }
        } else if (data.message_type === 'private') { // private message
            const insideOwners = owners && data.sender.user_id in owners

            if (!insideOwners){
                console.log(`用户 ${data.sender.nickname} 没有权限去执行指令，已略过`)
                return // no permission
            }

            const msg = data.message.substring(1).trim()
            const command = msg.split(' ')
            const [cmd, ...args] = command

            const actions = {
                send: async (msg) => await context_send_private(ws, data, msg),
                data,
                commands
            }

            // todo: private command handles
            try {
                return await invoke(actions, cmd, args)
            }catch(err){
                console.warn('执行指令时出现错误')
                console.error(err)
                return false
            }
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


async function context_send_private(contexnt, data, msg) {
    await context.send('send_private_msg', { // i can await a non async function
        user_id: data.sender.user_id,
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