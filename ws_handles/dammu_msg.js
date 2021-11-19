const { sendMessage, sendMessagePrivate, filterAndBroadcast } = require("../el/utils")
const storer = require('../el/data-storer')

module.exports = async ({ ws, http }, data) => {
    const liveName = data.name
    const info = data.content.info
    const danmaku = info[1]
    const [uid, uname] = info[2]

    const blive = (await storer.read())?.blive
    const { highlight, highlight_private } = blive ?? { highlight: {}, highlight_private: {} }

    const messages = [
        `${uname} 在 ${liveName} 的直播间发送了一则讯息`,
        `弹幕: ${danmaku}`
    ]

    // 广播到群
    const sends = filterAndBroadcast(highlight, uid, sendMessage, ws, messages)
    if (sends.length > 0) {
        Promise.all(sends)
            .then(sent => console.log(`高亮弹幕通知已发送给 ${sent.length} 个QQ群组。`))
            .catch(err => {
                console.warn(`發送广播通知时出现错误: ${err?.message}`)
                console.warn(err)
            })
    }
    // =========

    // ==== 广播到 私聊 ====
    const private_sends = filterAndBroadcast(highlight_private, uid, sendMessagePrivate, ws, messages)
    if (private_sends.length > 0) {
        Promise.all(private_sends)
                .then(sent => console.log(`高亮弹幕通知已发送给 ${sent.length} 个QQ号`))
                .catch(err => {
                    console.warn(`發送广播通知时出现错误: ${err?.message}`)
                    console.warn(err)
                })
    }

}