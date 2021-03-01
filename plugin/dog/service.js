const axios = require('axios')

async function getDog() {
  try {
    const { data } = await axios('https://v1.alapi.cn/api/dog?format=text')
    return [
      {
        type: 'text',
        data: {
          text: data
        }
      }
    ]
  } catch (e) {
    console.error('[dog]', e)
    return [
      {
        type: 'text',
        data: {
          text: '舔不动了'
        }
      }
    ]
  }
}

module.exports = {
  getDog
}
