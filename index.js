const { ws, http } = require('./bot')
const config = require('./config')
const messager = require('./el/api/message-source')

const plugins = Object.keys(config.plugin).map(name =>
  require(name)(config.plugin[name] || {})
)



async function executePlugins(data) {
  for (const plugin of plugins) {
    try {
      const result = await plugin({ data, ws, http })
      if (result) { // 停止往下执行
        break
      }
    } catch (err) {
      console.warn(`执行插件时出现错误: ${err?.message}`)
      console.error(err)
    }
  }
}

// 同时启动 Redis 和 WS 监控
console.log('正在启动 vup monitors...')
Promise.all([ ws.startWS(), messager.connect()])
  .then(() => {
    ws.listen(data => {
      if (process.env.NODE_ENV === 'development') {
        console.log(data)
      }
      executePlugins(data)
    })
  })
  .catch(console.error)