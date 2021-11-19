const { CommandExecutor } = require('../el/types');
const storer = require('../el/data-storer')
const { validUser } = require('../el/utils');

class AddFocus extends CommandExecutor {

    async execute({ send, data }, args) {
        const isGroup = data.message_type === 'group'
        const required_length = isGroup ? 1 : 2
        const parameters = isGroup ? '<用户ID>' : '<用户ID> <群ID>'

        if (args.length < required_length) {
            await send(`缺少参数: ${parameters}`)
            return
        }

        const uid = Number.parseInt(args[0])

        if (isNaN(uid)) {
            await send(`${uid} 不是一个有效的用户id`)
            return
        }

        const valid = await validUser(uid)
        if (!valid) {
            await send(`找不到用户 ${uid}`)
            return
        }

        if (!isGroup) {
            const group_id = Number.parseInt(args[1])
            if (!group_id) {
                await send('不是一个有效的群ID')
                return
            }
            data.group_id = group_id
        }

        const json = await storer.read()
        const blive = json.blive

        if (!blive.focus_users) {
            blive.focus_users = {}
        }

        const focus_users = blive.focus_users

        if (!focus_users[data.group_id]) {
            focus_users[data.group_id] = []
        }

        if (focus_users[data.group_id].includes(uid)) {
            await send(`用户 ${uid} 已经在群 ${data.group_id} 的注视用户名单内。`)
            return
        }

        focus_users[data.group_id].push(uid)

        await storer.save(json)
        await send(`已成功添加用户 ${uid} 到群 ${data.group_id} 的注视用户名单内。`)

    }
}

class RemoveFocus extends CommandExecutor {

    async execute({ send, data }, args) {
        const isGroup = data.message_type === 'group'
        const required_length = isGroup ? 1 : 2
        const parameters = isGroup ? '<用户ID>' : '<用户ID> <群ID>'

        if (args.length < required_length) {
            await send(`缺少参数: ${parameters}`)
            return
        }

        const uid = Number.parseInt(args[0])

        if (isNaN(uid)) {
            await send(`${uid} 不是一个有效的用户id`)
            return
        }

        if (!isGroup) {
            const group_id = Number.parseInt(args[1])
            if (!group_id) {
                await send('不是一个有效的群ID')
                return
            }
            data.group_id = group_id
        }

        const json = await storer.read()
        const blive = json.blive

        if (!blive.focus_users) {
            blive.focus_users = {}
        }

        const focus_users = blive.focus_users

        if (!focus_users[data.group_id]) {
            await send(`用户 ${uid} 不在群 ${data.group_id} 的注视用户名单内。`)
            return
        }

        const list = focus_users[data.group_id]
        const index = list.indexOf(uid)

        if (index == -1){
            await send(`用户 ${uid} 不在群 ${data.group_id} 的注视用户名单内。`)
            return
        }
        
        list.splice(index, 1)

        await storer.save(json)
        await send(`用户 ${uid} 已从群 ${data.group_id} 的注视用户名单中移除。`)
    }
}

class Focusing extends CommandExecutor {


    async execute({ send, data }, args){
        const json = await storer.read()
        const focus_users = json?.blive?.focus_users ?? {}

        if (data.message_type !== 'group'){
            const group_id = Number.parseInt(args[0])
            if (!group_id){
                await send('不是一个有效的群ID')
                return
            }
            data.group_id = group_id
        }

        const focusing = focus_users[data.group_id] ?? []
        await send(`群 ${data.group_id} 的注视用户列表: ${focusing}`)
    }
}

module.exports = {
    '新增': AddFocus,
    '移除': RemoveFocus,
    '列表': Focusing
}