const { sendMessage } = require("../el/utils")
const storer = require('../el/data-storer')

module.exports = async ({ws, http}, data) => {
    const superchat = data.content.data
    const liveName = data.name
    const { uid, price, message, user_info } = superchat
    const { uname } = user_info
    const highlights = (await storer.read())?.blive?.highlight ?? {}
    const sends = Object.entries(highlights)
        .filter(([id, users]) => users.includes(uid))
        .map(([id, users]) => id)
        .map(group_id => sendMessage(ws, group_id, [
            `在 ${liveName} 的直播间收到来自 ${uname} 的醒目留言`, 
            `￥ ${price}`,
            `「${message}」`
        ]))
        
    if (sends.length == 0) return
    Promise.all(sends)
        .then(sent => console.log(`高亮醒目留言通知已发送给 ${sent.length} 个QQ群组。`))
}

