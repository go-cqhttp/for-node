const { sendMessage, sendMessagePrivate, filterAndBroadcast } = require("../el/utils")
const storer = require('../el/data-storer')
const { send } = require("../bot/http")

module.exports = async ({ws, http}, data) => {
    const enter = data.content.data
    const liveName = data.name
    const { uname, uid } = enter

    const blive = (await storer.read())?.blive
    const { highlight, highlight_private } = blive?.highlight ?? { highlight: {}, highlight_private: {} }

    const messages =  `噔噔咚！你所关注的用户 ${uname} 进入了 ${liveName} 的直播间。`

    // === 广播到群聊 ===
    const sends = filterAndBroadcast(highlight, uid, sendMessage, ws, messages)
    if (sends.length > 0) {
        Promise.all(sends)
            .then(sent => console.log(`房间进入通知已发送给 ${sent.length} 个QQ群组。`))
    }

    // === 广播到 QQ 号 ===
    const private_sends =  filterAndBroadcast(highlight_private, uid, sendMessagePrivate, ws, messages)

    if (private_sends.length > 0){
        Promise.all(private_sends)
            .then(sent => console.log(`房间进入通知已发送给 ${sent.length} 个QQ号。`))
    }
}