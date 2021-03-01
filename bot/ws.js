const WebSocket = require('ws')
const config = require('../config')

const ws = new WebSocket(config.bot.ws)

module.exports = {
  send(action, params) {
    ws.send(JSON.stringify({ action, params }))
  },
  listen(callback) {
    ws.on('message', data => {
      try {
        callback(JSON.parse(data))
      } catch (e) {
        console.error(e)
      }
    })
  }
}
