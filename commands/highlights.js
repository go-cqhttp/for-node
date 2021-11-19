const { CommandExecutor } = require('../el/types');
const storer = require('../el/data-storer')
const { validUser } = require('../el/utils')

const KEY_GROUP = 'highlight'
const KEY_PRIVATE = 'highlight_private'

class AddUser extends CommandExecutor {

    async execute({ send, data }, args) {

        const is_group = data.message_type === 'group'

        const parameters = is_group ? '<用户id>' : '<用户id> [群id]'

        if (!args[0]) {
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

        if (!is_group && args[1]) { // 不是群聊發送，但是有輸入 [群 id]
            data.group_id = Number.parseInt(args[1])
        }

        const group_id = data.group_id
        const json = await storer.read()
        const blive = json['blive']

        // variables
        let id = group_id
        let key = KEY_GROUP
        let inside = `用户 ${uid} 已在群 ${group_id} 的高亮名单内。`
        let added = `用户 ${uid} 已新增到群 ${group_id} 的高亮名单。`

        if (!group_id) {  // in private
            id = data.sender.user_id
            key = KEY_PRIVATE
            inside = `用户 ${uid} 已在你的高亮名单内。`
            added = `用户 ${uid} 已新增到你的高亮名单。`
        }

        if (!blive[key]) {
            blive[key] = {}
        }

        const highlight = blive[key]

        if (!highlight[id]) {
            highlight[id] = []
        }

        if (highlight[id].includes(uid)) {
            await send(inside)
            return
        }

        highlight[id].push(uid)
        await storer.save(json)
        await send(added)
    }
}


class RemoveUser extends CommandExecutor {

    async execute({ send, data }, args) {

        const is_group = data.message_type === 'group'

        const parameters = is_group ? '<用户id>' : '<用户id> [群id]'

        if (!args[0]) {
            await send(`缺少参数: ${parameters}`)
            return
        }

        const uid = Number.parseInt(args[0])
        if (isNaN(uid)) {
            await send(`${uid} 不是一个有效的用户id`)
            return
        }

        if (!is_group && args[1]) { // 不是群聊發送，但是有輸入 [群 id]
            data.group_id = Number.parseInt(args[1])
        }

        const group_id = data.group_id
        const json = await storer.read()
        const blive = json['blive']

        // variables
        let id = group_id
        let key = KEY_GROUP
        let non_exist = `用户 ${uid} 并不在群 ${group_id} 的高亮名单内。`
        let removed = `用户 ${uid} 已从群 ${group_id} 的高亮名单中移除。`

        if (!group_id) { // in private
            id = data.sender.user_id
            key = KEY_PRIVATE
            non_exist = `用户 ${uid} 并不在你的高亮名单内。`
            removed = `用户 ${uid} 已从你的高亮名单中移除。`
        }

        if (!blive[key]) {
            blive[key] = {}
        }

        const highlight = blive[key]

        if (!highlight[id]) {
            await send(non_exist)
            return
        }

        const list = highlight[id]

        const index = list.indexOf(uid)

        if (index == -1){
            await send(non_exist)
            return
        }

        list.splice(index, 1)

        if (list.length == 0) {
            delete highlight[id]
        }

        await storer.save(json)
        await send(removed)

    }
}


class HighLighting extends CommandExecutor {

    async execute({ send, data }, args) {

        const is_group = data.message_type === 'group'

        if (!is_group && args[0]) {
            data.group_id = Number.parseInt(args[0])
        }

        const json = await storer.read()
        const blive = json['blive']
        const group_id = data.group_id

        // variables
        let id = group_id
        let key = KEY_GROUP
        let lst_str = `群 ${group_id} 的高亮用戶列表: `

        if (!group_id) {
            id = data.sender.user_id
            key = KEY_PRIVATE
            lst_str = `你的高亮用戶列表: `
        }

        if (!blive[key]) {
            blive[key] = {}
        }
        const highlight = blive[key]
        const users = highlight[id] ?? []
        await send(`${lst_str} ${users}`)
    }
}

module.exports = {
    '新增': AddUser,
    '移除': RemoveUser,
    '列表': HighLighting
}