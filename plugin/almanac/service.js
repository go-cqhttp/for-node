const axios = require('axios')
const iconv = require('iconv-lite')
const t = require('./t')

async function getInfo(date = new Date()) {
  const { data } = await axios({
    responseType: 'arraybuffer',
    url: 'https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php',
    params: {
      query: `${date.getFullYear()}年${date.getMonth() + 1}月`,
      resource_id: 39043,
      ie: 'utf8',
      oe: 'gbk',
      format: 'json',
      tn: 'wisetpl',
    },
    headers: {
      Referer: 'https://www.baidu.com/',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
    },
  })

  const tt = t()
  tt.classifyAlmanacsByYearMonth(
    JSON.parse(iconv.decode(data, 'gbk')).data[0].almanac
  )
  return tt.getSingleDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  })
}

async function getDetail() {
  const info = await getInfo()
  return [
    {
      type: 'text',
      data: {
        text: [
          `${info.year}-${info.month}-${info.day}`,
          `星期${info.cnDay}`,
          `${info.lMonth}月${info.lDate}`,
          `${info.gzYear}年 ${info.animal}`,
          `${info.gzMonth}月 ${info.gzDate}日`,
          `${info.term}`,
          `宜 ${info.suit}`,
          `忌 ${info.avoid}`,
        ].join('\n'),
      },
    },
  ]
}

module.exports = {
  getDetail,
}
