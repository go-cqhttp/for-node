const { sendMessage, sendMessagePrivate, filterAndBroadcast } = require("../el/utils")
const storer = require('../el/data-storer')




module.exports = async ({ ws, http }, data) => {
    const superchat = data.content.data
    const liveName = data.name
    const { uid, price, message, user_info } = superchat
    const { uname } = user_info

    const blive = (await storer.read())?.blive
    const { highlight, highlight_private } = blive?.highlight ?? { highlight: {}, highlight_private: {} }

    const messages = [
        `在 ${liveName} 的直播间收到来自 ${uname} 的醒目留言`,
        `￥ ${price}`,
        `「${message}」`
    ]

    // === 广播到Q群 ===
    const sends = filterAndBroadcast(highlight, uid, sendMessage, ws, messages)
    if (sends.length > 0) {
        Promise.all(sends)
        .then(sent => console.log(`高亮醒目留言通知已发送给 ${sent.length} 个QQ群组。`))
    }

    // === 广播到 QQ号 ===
    const private_sends = filterAndBroadcast(highlight_private, uid, sendMessagePrivate, ws, messages)
    if (private_sends.length > 0) {
        Promise.all(private_sends)
            .then(sent => console.log(`高亮醒目留言通知已发送给 ${sent.length} 个QQ群组。`))
    }

}

