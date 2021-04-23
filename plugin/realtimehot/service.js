const axios = require('axios')
const cheerio = require('cheerio')

const ICON_MAP = {
  boil: '沸',
  new: '新',
  recommend: '荐',
  hot: '热',
}

async function getList() {
  try {
    const { data } = await axios(
      'https://s.weibo.com/top/summary?cate=realtimehot'
    )
    const $ = cheerio.load(data)
    const top10 = [...$('.list_a > li')].slice(1, 11).map(item => {
      const title = $(item).find('span').text()
      const number = $(item).find('span > em').text()
      return {
        title: title.replace(number, '').trim(),
        number,
        type:
          ICON_MAP[
            ($(item).find('i').attr('class') || '').replace('icon icon_', '')
          ] || '',
      }
    })
    return [
      {
        type: 'text',
        data: {
          text: '微博热搜\n' + top10.map(item => `[${item.type}${item.number}] ${item.title}`).join('\n'),
        },
      },
    ]
  } catch (e) {
    console.error('[realtimehot]', e)
    return [
      {
        type: 'text',
        data: {
          text: '微博服务器瘫痪了~',
        },
      },
    ]
  }
}

module.exports = {
  getList,
}

getList().then(r => console.log(r[0].data))
