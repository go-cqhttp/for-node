const axios = require('axios')

const http = axios.create({
  baseURL: 'http://0.0.0.0:5700',
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
