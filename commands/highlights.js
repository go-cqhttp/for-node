const { CommandExecutor } = require('../el/types');
const storer = require('../el/data-storer')
const { validUser } = require('../el/utils')

const user_cache = {}

class AddUser extends CommandExecutor {

    async execute({ send, data }, args) {
        if(!args[0]) {
            await send('缺少参数: <用户id> [群id]')
            return
        }
        const uid = Number.parseInt(args[0])
        if (isNaN(uid)){
            await send(`${uid} 不是一个有效的用户id`)
            return
        }
        if (user_cache[uid] !== undefined) {
            if (!user_cache[uid]) { // invalid room
                await send(`找不到用户 ${uid}`)
                return
            }
        }else{
            const valid = await validUser(uid)
            user_cache[uid] = valid
            if (!valid){
                await send(`找不到用户 ${uid}`)
                return
            }
        }
        const input_gp_id = args[1] ? Number.parseInt(args[1]) : NaN
        const group_id = data.group_id ?? input_gp_id
        const json = await storer.read()
        const blive = json['blive']

        // variables
        let id = group_id
        let key = 'highlight'
        let inside = `用户 ${uid} 已在群 ${group_id} 高亮名单内。`
        let added = `用户 ${uid} 已新增到群 ${group_id} 的高亮名单。`

        if (!group_id){  // in private
            id = data.sender.user_id
            key = 'highlight_private'
            inside = `用户 ${uid} 已在你的高亮名单内。`
            added = `用户 ${uid} 已新增到你的高亮名单。`
        }

        if (!blive[key]){
            blive[key] = {}
        }

        const highlight = blive[key]

        if (!highlight[id]){
            highlight[id] = []
        }

        if (highlight[id].includes(uid)){
            await send(inside)
            return
        }

        highlight[id].push(uid)
        await storer.save(json)
        await send(added)
    }
}


class RemoveUser extends CommandExecutor {

    async execute({ send, data}, args) {
        if(!args[0]) {
            await send('缺少参数: <用户id> [群id]')
            return
        }
        const uid = Number.parseInt(args[0])
        if (isNaN(uid)){
            await send(`${uid} 不是一个有效的用户id`)
            return
        }
        
        const input_gp_id = args[1] ? Number.parseInt(args[1]) : NaN
        const group_id = data.group_id ?? input_gp_id
        const json = await storer.read()
        const blive = json['blive']
        
        // variables
        let id = group_id
        let key = 'highlight'
        let non_exist = `用户 ${uid} 并不在群 ${group_id} 高亮名单内。`
        let removed = `用户 ${uid} 已从群 ${group_id} 的高亮名单中移除。`

        if (!group_id) { // in private
            id = data.sender.user_id
            key = 'highlight_private'
            non_exist = `用户 ${uid} 并不在群 ${group_id} 高亮名单内。`
            removed = `用户 ${uid} 已从群 ${group_id} 的高亮名单中移除。`
        }

        if (!blive[key]){
            blive[key] = {}
        }

        const highlight = blive[key]

        if (!highlight[id]){
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

        if (list.length == 0){
            delete highlight[id]
        }

        await storer.save(json)
        await send(removed)
        
    }
}


class HighLighting extends CommandExecutor {

    async execute({ send, data }, args) {
        const json = await storer.read()
        const blive = json['blive']
        const input_group_id = args[0] ? Number.parseInt(args[0]) : NaN
        const group_id = data.group_id ?? input_group_id

        let id = group_id
        let key = 'highlight'

        if (!group_id){}

        if (!blive['highlight']){
            blive['highlight'] = {}
        }
        const highlight = blive['highlight']
        const users = highlight[data.group_id] ?? []
        await send(`高亮用户列表: ${users}`)
    }
}

module.exports = {
    '新增': AddUser,
    '移除': RemoveUser,
    '列表': HighLighting
}