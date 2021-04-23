const axios = require('axios')
const cheerio = require('cheerio')

const ICON_MAP = {
  boil: '沸',
  new: '新',
  recommend: '荐',
  hot: '热',
}

async function getList(search) {
  try {
    if (search) {
      return [
        {
          type: 'text',
          data: {
            text: `https://s.weibo.com/weibo?q=${encodeURIComponent(search)}`,
          },
        },
      ]
    }

    const { data } = await axios(
      'https://s.weibo.com/top/summary?cate=realtimehot'
    )
    const $ = cheerio.load(data)
    const top10 = [...$('.list_a > li')]
      .slice(0, 20)
      .map((item, index) => {
        const title = $(item).find('span').text()
        const number = $(item).find('span > em').text()
        return {
          title: title.replace(number, '').trim(),
          number,
          type:
            index === 0
              ? '顶'
              : ICON_MAP[
                  ($(item).find('i').attr('class') || '').replace(
                    'icon icon_',
                    ''
                  )
                ] || '',
          url: $(item).find('a').attr('href'),
        }
      })
      .filter(item => item.type !== '荐')
      .slice(0, 10)

    return [
      {
        type: 'text',
        data: {
          text:
            '[微博热搜]\n' +
            top10
              .map((item, index) =>
                [index, item.type + item.number, item.title]
                  .map(item => String(item).trim())
                  .filter(item => item)
                  .join(' ')
              )
              .join('\n'),
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
