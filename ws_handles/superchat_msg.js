const { sendMessage, sendMessagePrivate, filterAndBroadcast } = require("../el/utils")
const storer = require('../el/data-storer')




module.exports = async ({ ws, http }, data) => {
    const superchat = data.content.data
    const liveName = data.live_info.name
    const { uid, price, message, user_info } = superchat
    const { uname } = user_info

    const blive = (await storer.read())?.blive
    const { highlight, highlight_private, focus_users } = blive ?? { highlight: {}, highlight_private: {}, focus_users: {} }

    let group_ids = Object.keys(highlight ?? {})
    if (focus_users) {
        group_ids = group_ids.filter((group_id) => {
            const users = focus_users[group_id]
            // 没有注视用户，则全部广播，
            if (!users || users.length == 0) return true
            // 那个用户正是那个群的注视用户，所以所有DD行为都要广播
            if (users.includes(uid)) return true
            // 否则，只检查注视用户的直播间
            return users.includes(data.live_info.uid)
        })
    }

    const group_highlight = {}

    group_ids.forEach((group_id) => group_highlight[group_id] = highlight[group_id])

    const messages = [
        `在 ${liveName} 的直播间收到来自 ${uname} 的醒目留言`,
        `￥ ${price}`,
        `「${message}」`
    ]

    // === 广播到Q群 ===
    const sends = filterAndBroadcast(group_highlight, uid, sendMessage, ws, messages)
    if (sends.length > 0) {
        Promise.all(sends)
        .then(sent => console.log(`高亮醒目留言通知已发送给 ${sent.length} 个QQ群组。`))
        .catch(err => {
            console.warn(`發送广播通知时出现错误: ${err?.message}`)
            console.warn(err)
        })
    }

    // === 广播到 QQ号 ===
    const private_sends = filterAndBroadcast(highlight_private, uid, sendMessagePrivate, ws, messages)
    if (private_sends.length > 0) {
        Promise.all(private_sends)
            .then(sent => console.log(`高亮醒目留言通知已发送给 ${sent.length} 个QQ群组。`))
            .catch(err => {
                console.warn(`發送广播通知时出现错误: ${err?.message}`)
                console.warn(err)
            })
    }

}

