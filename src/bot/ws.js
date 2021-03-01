const WebSocket = require('ws')

const ws = new WebSocket('ws://0.0.0.0:6700')

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
