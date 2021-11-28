const { createClient } = require('redis');
const settings = require('../data/settings.json')
const utils = require('./utils');
const { update, read } = require('./data-storer')
const { handleMessage } = require('./message-handler')

const subscribing = new Set()
const client = createClient({ socket: settings.redis })

module.exports = {
    client,

    connect: async () => {
        try {
            console.log('正在連接到 Redis Server')
            client.on('error', (err) => console.warn('Redis 連接失敗: ', err));
            await client.connect()
            await client.select(settings.redis.database)
            console.log('Redis 已成功連接')
            return client
        }catch(err){
            console.warn(`連接到 Redis 伺服器時出現錯誤: ${err?.message ?? err}, 五秒後重連...`)
            await utils.sleep(5000)
            return await module.exports.connect()
        }
    },

    listen: async (room, update_storage = true) => {
        if (subscribing.has(room)) return false
        await client.subscribe(`blive:${room}`, handleMessage)
        subscribing.add(room)
        if (update_storage){
            await update(data => {
                data.blive.subscribing = [...subscribing]
            })
        }
        return true
    },

    unlisten: async (room) => {
        if (!subscribing.has(room)) return false
        await client.unsubscribe(`blive:${room}`)
        subscribing.delete(room)
        await update(data => {
            data.blive.subscribing = [...subscribing]
        })
        return true
    },

    listening: () => new Set(subscribing)
}

async function fetchSubscribing(){
    const data = await read()
    const blive = data['blive']
    const rooms = blive.subscribing ?? []
    for (const room of rooms){
        await module.exports.listen(room, false)
    }
    return rooms.length
}

fetchSubscribing().then(length => console.log(`已从离线数据重新监控 ${length} 个直播间`)).catch(console.error)