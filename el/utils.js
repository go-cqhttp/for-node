module.exports = {
    sleep: async (ms) => new Promise((res,) => setTimeout(res, ms)),

    sendMessage: async (ctx, group_id, message) => {
        await ctx.send('send_group_msg', { 
            group_id: group_id,
            message: message instanceof Array ? message.join('\n') : message
        })
    }
}