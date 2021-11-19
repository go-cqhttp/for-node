const { CommandExecutor } = require("../el/types");
const redis = require('../el/redis_api')
const { validRoom } = require('../el/utils')
class BLiveListen extends CommandExecutor {


    async execute({ send, data }, args) {
        if (!args[0]) {
            await send('缺少参数: <房间号码>')
            return
        }
        const room = Number.parseInt(args[0])
        if (isNaN(room)) {
            await send(`${args[0]} 不是一个有效的房间号`)
            return
        }

        const valid = await validRoom(room)
        if (!valid) {
            await send(`找不到房间 ${room}`)
            return
        }

        const result = await redis.listen(room)
        const msg = result ? `已成功启动监听房间(${room})` : `该房间已启动监听(${room})`
        await send(msg)
    }

}


class BLiveTerminate extends CommandExecutor {

    async execute({ send, data }, args) {
        if (!args[0]) {
            await send('缺少参数: <房间号码>')
            return
        }
        const room = Number.parseInt(args[0])
        if (isNaN(room)) {
            await send(`${args[0]} 不是一个有效的房间号`)
            return
        }
        const result = await redis.unlisten(room)
        const msg = result ? `已成功中止监听房间(${room})` : `该房间没有被监听(${room})`
        await send(msg)
    }
}

class BLiveListening extends CommandExecutor {

    async execute({ send, data }, args) {
        const set = redis.listening()
        await send(`正在监听的房间: ${[...set]}`)
    }
}


module.exports = {
    '监控': BLiveListen,
    '中止': BLiveTerminate,
    '监听中': BLiveListening
}