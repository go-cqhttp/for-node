const axios = require('axios')
const config = require('../data/settings.json')

const http = axios.create({
  baseURL: config.bot.http,
  method: 'POST'
})

module.exports = {
  async send(action, params) {
    const { data } = await http({
      url: action,
      data: params
    })
    return data
  }
}
