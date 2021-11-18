const WebSocket = require('ws')
const config = require('../config')
const { bot } = require('../data/settings.json')
const { sleep } = require('../el/utils')


async function connect(){
  const ws = new WebSocket(bot.ws)

  return new Promise((res, rej) => {
    ws.on('error', err => {
      console.warn(`连接 WS 时出现错误: ${err?.message ?? err}`)
      rej(err)
    })

    ws.on('open', () => {
      console.log(`WS 连接成功。`)
      res(ws)
    })
  })
}

let ws = undefined

async function startWS(){
  try {
    const websocket = await connect()
    ws = websocket
    return ws
  }catch(err){
    console.warn('五秒后重连...')
    await sleep(5000)
    await startWS()
  }
}

module.exports = {
  startWS,
  send(action, params) {
    if (!ws) {
      console.warn(`WS 尚未连接，已略过。`)
      return
    }
    ws.send(JSON.stringify({ action, params }))
  },
  async listen(callback) {
    if (!ws) {
      console.warn(`WS 尚未连接，五秒后重试。`)
      await sleep(5000)
      await this.listen(callback)
      return
    }
    ws.on('message', data => {
      try {
        callback(JSON.parse(data))
      } catch (e) {
        console.error(e)
      }
    })
  }
}
