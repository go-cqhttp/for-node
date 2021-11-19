const { default: axios } = require("axios")


const valid_caches = {
    rooms: {},
    users: {}
}

module.exports = {
    sleep: async (ms) => new Promise((res,) => setTimeout(res, ms)),

    sendMessage: async (ctx, group_id, message) => {
        await ctx.send('send_group_msg', { 
            group_id,
            message: message instanceof Array ? message.join('\n') : message
        })
    },

    sendMessagePrivate: async (ctx, user_id, message) => {
        await ctx.send('send_private_msg', {
            user_id,
            message: message instanceof Array ? message.join('\n') : message
        })
    },

    validRoom: async (room) => {
        if (valid_caches.rooms[room] !== undefined){
            return valid_caches.rooms[room]
        }
        const res = await axios.get(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${room}`)
        if (res.status !== 200) throw new Error(res.statusText)
        const data = res.data
        return data.code == 0
    },

    validUser: async (uid) => {
        if (valid_caches.users[uid] !== undefined) {
            return valid_caches.users[uid]
        }
        const res = await axios.get(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`)
        if (res.status !== 200) throw new Error(res.statusText)
        const data = res.data
        return data.code == 0
    },

    filterAndBroadcast: (highlight, uid, send, ctx, messages) => {
        if (!highlight) {
            console.warn('高亮列表为空，将返回 []')
            return []
        }
        return Object.entries(highlight)
                    .filter(([id, users]) => users.includes(uid))
                    .map(([id, users]) => id)
                    .map(id => send(ctx, id, messages))
    }
}