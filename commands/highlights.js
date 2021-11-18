const { CommandExecutor } = require('../el/types');
const storer = require('../el/data-storer')

class AddUser extends CommandExecutor {

    async execute({ send, data }, args) {
        if(!args[0]) {
            await send('缺少参数: <用户id>')
            return
        }
        const uid = Number.parseInt(args[0])
        if (isNaN(uid)){
            await send(`${uid} 不是一个有效的用户id`)
            return
        }
        const group_id = data.group_id
        const json = await storer.read()
        const blive = json['blive']

        if (!blive['highlight']){
            blive['highlight'] = {}
        }

        const highlight = blive['highlight']

        if (!highlight[group_id]){
            highlight[group_id] = []
        }

        if (highlight[group_id].includes(uid)){
            await send(`用户 ${uid} 已在高亮名单内。`)
            return
        }

        highlight[group_id].push(uid)
        await storer.save(json)
        await send(`用户 ${uid} 已新增到高亮名单。`)
    }
}


class RemoveUser extends CommandExecutor {

    async execute({ send, data}, args) {
        if(!args[0]) {
            await send('缺少参数: <用户id>')
            return
        }
        const uid = Number.parseInt(args[0])
        if (isNaN(uid)){
            await send(`${uid} 不是一个有效的用户id`)
            return
        }
        const group_id = data.group_id
        const json = await storer.read()
        const blive = json['blive']
        
        if (!blive['highlight']){
            blive['highlight'] = {}
        }

        const highlight = blive['highlight']

        if (!highlight[group_id]){
            await send(`用户 ${uid} 并不在高亮名单内。`)
            return
        }

        const list = highlight[group_id]

        const index = list.indexOf(uid)

        if (index == -1){
            await send(`用户 ${uid} 并不在高亮名单内。`)
            return
        }

        list.splice(index, 1)

        if (list.length == 0){
            delete highlight[group_id]
        }

        await storer.save(json)
        await send(`用户 ${uid} 已从高亮名单中移除。`)
    }
}


class HighLighting extends CommandExecutor {

    async execute({ send, data }, args) {
        const json = await storer.read()
        const blive = json['blive']
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