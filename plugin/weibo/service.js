const axios = require('axios')
const cheerio = require('cheerio')

const ICON_MAP = {
  boil: '沸',
  new: '新',
  recommend: '荐',
  hot: '热',
}

function searchWeibo(q) {
  return [
    {
      type: 'text',
      data: {
        text: `https://s.weibo.com/weibo?q=${encodeURIComponent(q)}`,
      },
    },
  ]
}

async function listResou(cookie) {
  const { data } = await axios({
    url: 'https://s.weibo.com/top/summary?cate=realtimehot',
    headers: {
      cookie
    }
  })
  const $ = cheerio.load(data)
  return [...$('.list_a > li')]
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
    .slice(1, 11)
}

async function getList(search, options = {}) {
  try {
    if (search) {
      return searchWeibo(search)
    }

    return [
      {
        type: 'text',
        data: {
          text:
            '微博热搜\n\n' +
            (await listResou(options.cookie)).map(item => item.title.trim()).join('\n'),
        },
      },
    ]
  } catch (e) {
    console.error('[weibo]', e)
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
