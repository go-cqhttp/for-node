const { createClient } = require('redis');
const settings = require('../../data/settings.json')
const utils = require('../utils');

const { handleMessage } = require('../message-handler');
const { MessageSource } = require('../types');


class RedisSource extends MessageSource {


    constructor(){
        super()
        this.client = createClient({ socket: {
            ...settings.redis,
            reconnectStrategy: (num) => {
                console.log(`重連第 ${num+1} 次，五秒後重連`)
                return 5000
            }
        } })
    }

    async connectInternal(){
        try {
            console.log('正在連接到 Redis Server')
            this.client.on('error', (err) => {
                console.warn(`連接到 Redis 伺服器時出現錯誤: ${err?.message ?? err}`)
            })
            this.client.on('end', async () => { 
                console.log(`Redis 伺服器意外關閉，五秒後重連`)
                this.client.removeAllListeners()
                await utils.sleep(5000)
                await this.connect()
             })
            await this.client.connect()
            await this.client.select(settings.redis.database)
            console.log('Redis 已成功連接')
        }catch(err){
            console.warn(`Redis 伺服器連線錯誤: ${err}`)
          
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