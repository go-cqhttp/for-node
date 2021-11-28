const redisSource = require('./redis_api')
const websocketSource = require('./websocket_api')
const { source } = require('../../data/settings.json')


const sources = {
    ...redisSource,
    ...websocketSource
}


const MessageSource = sources[source]

if (!MessageSource){
    throw new Error(`未知的连线来源: ${source}`)
}else{
    console.log(`正在使用连线源: ${source}`)
}

const messager = new MessageSource()
module.exports = messager