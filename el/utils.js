const { default: axios } = require("axios")

module.exports = {
    sleep: async (ms) => new Promise((res,) => setTimeout(res, ms)),

    sendMessage: async (ctx, group_id, message) => {
        await ctx.send('send_group_msg', { 
            group_id: group_id,
            message: message instanceof Array ? message.join('\n') : message
        })
    },

    validRoom: async (room) => {
        const res = await axios.get(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${room}`)
        if (res.status !== 200) throw new Error(res.statusText)
        const data = res.data
        return data.code == 0
    },

    validUser: async (uid) => {
        const res = await axios.get(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`)
        if (res.status !== 200) throw new Error(res.statusText)
        const data = res.data
        return data.code == 0
    }
}