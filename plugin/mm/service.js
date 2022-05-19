const random = require('random')
const axios = require('axios')

const max = 130
const publicPath = 'https://gh.api.99988866.xyz/https://raw.githubusercontent.com/forked-repositories/cos_pics/master/'

async function getCos() {
  try {
    const cos = 'cos_' + ('0000' + random.int(0, max)).slice(-4)
    let { data } = await axios(`${publicPath}${cos}.js`)
    data = JSON.parse(data.trim().slice(cos.length + 1, -1))
    const item = data[random.int(0, data.length - 1)]
    const file = publicPath + item.path
    return [
      {
        type: 'image',
        data: {
          file
        }
      },
      {
        type: 'text',
        data: {
          text: `\n${item.category} - ${item.suite}`
        }
      }
    ]
  } catch (e) {
    console.error('[mm]', e)
    return [
      {
        type: 'text',
        data: {
          text: '妹妹走丢了'
        }
      }
    ]
  }
}

module.exports = {
  getCos
}
