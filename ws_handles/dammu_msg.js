const { sendMessage } = require("../el/utils")
const storer = require('../el/data-storer')

module.exports = async ({ws, http}, data) => {
    const liveName = data.name
    const info = data.content.info
    const danmaku = info[1]
    const [uid, uname] = info[2]
    const highlights = (await storer.read())?.blive?.highlight ?? {}
    const sends = Object.entries(highlights)
        .filter(([id, users]) => users.includes(uid))
        .map(([id, users]) => id)
        .map(group_id => sendMessage(ws, group_id, [
            `${uname} 在 ${liveName} 的直播间发送了一则讯息`, 
            `弹幕: ${danmaku}`
        ]))
        
    if (sends.length == 0) return
    Promise.all(sends)
        .then(sent => console.log(`高亮弹幕通知已发送给 ${sent.length} 个QQ群组。`))

}