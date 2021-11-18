const { sendMessage } = require("../el/utils")
const storer = require('../el/data-storer')
const { send } = require("../bot/http")

module.exports = async ({ws, http}, data) => {
    const enter = data.content.data
    const liveName = data.name
    const { uname, uid } = enter
    const highlights = (await storer.read())?.blive?.highlight ?? {}
    const sends = Object.entries(highlights)
        .filter(([id, users]) => users.includes(uid))
        .map(([id, users]) => id)
        .map(group_id => sendMessage(ws, group_id, 
            `噔噔咚！你所关注的用户 ${uname} 进入了 ${liveName} 的直播间。`
        ))
        
    if (sends.length == 0) return
    Promise.all(sends)
        .then(sent => console.log(`房间进入通知已发送给 ${sent.length} 个QQ群组。`))
}