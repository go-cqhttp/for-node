const WebSocket = require('ws')
const { websocket } = require('../../data/settings.json')
const utils = require('../utils')
const { default: axios } = require('axios')
const FormData = require('form-data')

const { MessageSource } = require('../types')
const { handleMessage } = require('../message-handler');

class WebSocketSouce extends MessageSource {


    constructor(){
        super()
        this.websocketURL = `ws${websocket['use-tls'] ? 's' : ''}://${websocket.host}/ws`
        const baseURL = `http${websocket['use-tls'] ? 's' : ''}://${websocket.host}/subscribe/`
        this.api = axios.create({
            baseURL,
            timeout: 5000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }

    async connect(){
        try {
            this.client = await initWebSocket(this.websocketURL)
            console.log(`已成功连接到 WebSocket 服务器`)
            this.client.on('message', console.log)
        }catch(err){
            console.warn(`連接到 WebSocket 服务器時出現錯誤: ${err?.message ?? err}, 五秒後重連...`)
            await utils.sleep(5000)
            return await this.connect()
        }
    }

    async listenInternal(room){
        const form = new FormData()
        form.append('subscribes', room)
        try {
            await this.api.put('add', form, { headers: form.getHeaders() })
        }catch(err){
            throw new Error(err?.response?.data?.error ?? err?.response?.data ?? err)
        }
    }


    async unlistenInternal(room){
        const form = new FormData()
        form.append('subscribes', room)
        try {
            await this.api.put('remove', form, { headers: form.getHeaders() })
        }catch(err){
            throw new Error(err?.response?.data?.error ?? err?.response?.data ?? err)
        }
    }

}

async function initWebSocket(url){
    return new Promise((res, rej) => {
        const client = new WebSocket(url)
        client.on('open', () => res(client))
        client.on('error', rej)
    })
}


module.exports = {
    'websocket': WebSocketSouce
}