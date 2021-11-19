const { invoke } = require('../el/command-manager')
const { owners } = require('../data/settings.json')
const { commands } = require('../config')

module.exports = options => {
    return async({data, ws, http}) => {
        if (!data.message) return false
        if (data.message[0] !== '!') return false // 指令用 ! 开头

        const is_group = data.message_type === 'group'

        const isAdmin = is_group ? data.sender.role === 'admin' : false
        const insideOwners = owners && owners.includes(data.sender.user_id)

        if (!isAdmin && !insideOwners){
            // maybe say something for no permission
            console.log(`用户 ${data.sender.nickname} 没有权限去执行指令，已略过`)
            return false // no permission
        }

        const msg = data.message.substring(1).trim()
        const command = msg.split(' ')
        const [cmd, ...args] = command

        const actions = { data, commands }

        if (is_group) {
            actions.send = async (msg) => await context_send(ws, data, msg)
        }else{
            actions.send = async (msg) => await context_send_private(ws, data, msg)
        }

        try {
            console.debug(`正在处理 ${is_group ? '群' : '私聊'} 指令: ${cmd}, 参数: ${args}`)
            return await invoke(actions, cmd, args)
        }catch(err){
            console.warn('执行指令时出现错误')
            console.error(err)
            return false
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


async function context_send_private(context, data, msg) {
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