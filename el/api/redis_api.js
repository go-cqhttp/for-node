const { createClient } = require('redis');
const settings = require('../../data/settings.json')
const utils = require('../utils');

const { handleMessage } = require('../message-handler');
const { MessageSource } = require('../types');


class RedisSource extends MessageSource {


    constructor(){
        super()
        this.client = createClient({ socket: settings.redis })
    }

    async connect(){
        try {
            console.log('正在連接到 Redis Server')
            this.client.on('error', (err) => console.warn(`Redis 连线失败: ${err?.message ?? err}`));
            await this.client.connect()
            await this.client.select(settings.redis.database)
            console.log('Redis 已成功連接')
            return this.client
        }catch(err){
            console.warn(`連接到 Redis 伺服器時出現錯誤: ${err?.message ?? err}, 五秒後重連...`)
            await utils.sleep(5000)
            return await this.connect()
        }
    }


    async listenInternal(room){
        await this.client.subscribe(`blive:${room}`, handleMessage)
    }

    async unlistenInternal(room){
        await this.client.unsubscribe(`blive:${room}`)
    }

}

module.exports = {
    "redis": RedisSource
}