const { ws, http } = require('./bot')
const config = require('./config')

const plugins = Object.keys(config.plugin).map(name =>
  require(name)(config.plugin[name] || {})
)

ws.listen(data => {
  console.log(data)

  if (!('message' in data)) {
    return
  }

  plugins.forEach(plugin => plugin({ data, ws, http }))
})
