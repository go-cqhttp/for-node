const exception = new Set()

function handleMessage(string){
    try {
        const {ws, http} = require('../bot/index')
        const config = require('../config')
        if (typeof string !== 'string') {
            console.warn(`接收的讯息类型为 ${typeof string} 而不是 string, 已略过`)
            return
        }
        const message = JSON.parse(string)
        if (!config.ws_handles) return
        if (exception.has(message.command)) return
        const handle = config.ws_handles[message.command]
        if (!handle){
            console.log(`找不到指令 ${message.command} 的处理，已略过`)
            exception.add(message.command)
            return
        }
        handle({ws, http}, message).catch(err => {
            console.warn(`执行指令 ${message.command} 时出现错误: ${err?.message}`)
            console.error(err)
        })
    }catch(err) {
        console.warn(`接收 redis 数据时出现错误: ${err?.message ?? err}`)
    }
}


module.exports = {
    handleMessage
}