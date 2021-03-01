const { ws, http } = require('./bot')
const plugins = [require('./plugin/dog')]

ws.listen(data => {
  console.log(data)

  if (!('message' in data)) {
    return
  }

  plugins.forEach(plugin => plugin({ data, ws, http }))
})
