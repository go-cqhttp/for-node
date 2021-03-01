const axios = require('axios')
const config = require('../config')

const http = axios.create({
  baseURL: config.bot.http,
  method: 'POST'
})

module.exports = {
  async send(action, params) {
    try {
      const { data } = http({
        url: action,
        data: params
      })
      return data
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
