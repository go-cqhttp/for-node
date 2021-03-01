const { ws, http } = require('./bot')
const config = require('./config')

const plugins = Object.keys(config.plugin).map(name =>
  require(name)(config.plugin[name] || {})
)

ws.listen(data => {
  if (process.env.NODE_ENV === 'development') {
    console.log(data)
  }

  plugins.forEach(plugin => plugin({ data, ws, http }))
})
