const axios = require('axios')

async function getMsg(msg) {
  try {
    var key = ""  //填写自己的天行机器人的key
    var url = 'http://api.tianapi.com/txapi/robot/index?key='+key+'&question='+encodeURIComponent(msg)
    const { data } = await axios(url)
    return [
      {
        type: 'text',
        data: {
          text: data.newslist[0].reply
        }
      }
    ]
  } catch (e) {
    console.error('[chat]', e)
    return [
      {
        type: 'text',
        data: {
          text: '出了点小问题,重试一下呢？'
        }
      }
    ]
  }
}

module.exports = {
  getMsg
}
