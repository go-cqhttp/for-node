// http://fund.eastmoney.com/js/fundcode_search.js
// http://fund.eastmoney.com/js/jjjz_gs.js
// http://fundgz.1234567.com.cn/js/001186.js

const cheerio = require('cheerio')
const axios = require('axios')
const { getCenter } = require('./util')
const fundcodeSearch = require('./fundcode-search')
// const jjjzGs = require('./jjjz-gs')

const fundcodeNameMap = new Map(fundcodeSearch.map(item => [item[2], item]))
const fundcodeNameList = fundcodeSearch.map(item => item[2])
// cache
const fundcodeCodeMap = new Map()
const chicangMap = new Map()

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36'

async function getStockCodesNew(code) {
  try {
    let { data } = await axios({
      url: `http://fund.eastmoney.com/pingzhongdata/${code}.js`,
      timeout: 5000,
      headers: {
        'user-agent': USER_AGENT
      }
    })
    if (!data) {
      return ''
    }
    return JSON.parse(
      getCenter(data, 'var stockCodesNew =', ';/*基金持仓债券代码')
    ).join(',')
  } catch (e) {
    console.error('[fund]', e)
    return ''
  }
}

async function getChiCangNew(code) {
  try {
    let { data } = await axios({
      url: `https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery18309362619702541979_1613979058115&fltt=2&invt=2&&fields=f3,f12,f14&secids=${await getStockCodesNew(
        code
      )}`,
      timeout: 5000,
      headers: {
        'user-agent': USER_AGENT
      }
    })
    if (!data) {
      return []
    }
    return JSON.parse(
      getCenter(data, 'jQuery18309362619702541979_1613979058115(', ');')
    ).data.diff
  } catch (e) {
    console.error('[fund]', e)
    return []
  }
}

async function getChiCangHtml(code) {
  try {
    let { data } = await axios({
      url: `http://fund.eastmoney.com/${code}.html`,
      timeout: 5000,
      headers: {
        'user-agent': USER_AGENT
      }
    })
    if (!data) {
      return []
    }

    const $ = cheerio.load(data)
    const list = []
    $('#position_shares table')
      .find('tr')
      .each((index, item) => {
        const temp = []
        $(item)
          .find('td:lt(3)')
          .each((index2, item2) => {
            temp.push($(item2).text().trim().replace(/%|\s+/g, ''))
          })
        list.push(temp)
      })
    return list.slice(1)
  } catch (e) {
    console.error('[fund]', e)
    return []
  }
}

async function getChiCang(code) {
  try {
    const cache = chicangMap.get(code)
    if (cache && Date.now() - cache.time < 1000 * 60) {
      return cache.data
    }

    let [htmlData, newData] = await Promise.all([
      getChiCangHtml(code),
      getChiCangNew(code)
    ])
    if (!htmlData.length || !newData.length) {
      return ''
    }

    htmlData = [
      '股票名称 持仓占比 涨跌幅',
      ...htmlData.map(
        (item, index) =>
          `${item[0]}(${newData[index].f12}) ${item[1]} ${newData[index].f3}`
      )
    ]

    const data = '\n\n' + htmlData.join('\n')
    chicangMap.set(code, { time: Date.now(), data })

    // const $ = cheerio.load(data)
    // data = '\n\n' + getChiCangTable($, '#position_shares table')

    // chicang_map.set(code, { time: Date.now(), data })
    return data
  } catch (e) {
    console.error('[fund]', e)
    return ''
  }
}

async function getDetail(code) {
  try {
    const cache = fundcodeCodeMap.get(code)
    if (cache && Date.now() - cache.time < 1000 * 60) {
      return cache.data
    }

    let { data } = await axios({
      url: `http://fundgz.1234567.com.cn/js/${code}.js`,
      timeout: 5000,
      headers: {
        'user-agent': USER_AGENT
      }
    })

    data = getCenter(data, 'jsonpgz(', ');')
    if (!data) {
      return null
    }

    data = JSON.parse(data)
    if (new Date() - new Date(data.jzrq) > 1000 * 60 * 60 * 24 * 14) {
      return null
    }

    fundcodeCodeMap.set(code, { time: Date.now(), data })
    return data
  } catch (e) {
    console.error('[fund]', e)
    return null
  }
}

async function findFund(codeOrName) {
  codeOrName = codeOrName.toUpperCase()

  if (!codeOrName) {
    return [
      '[指令]',
      '基金/JJ 代码/名称',
      '',
      '[示例]',
      '基金 161725',
      'JJ 白酒'
    ].join('\n')
  }

  const list = (/^\d{6}$/.test(codeOrName)
    ? [await getDetail(codeOrName)]
    : await Promise.all(
        fundcodeNameList
          .filter(name => name.includes(codeOrName))
          .map(name => fundcodeNameMap.get(name)[0])
          .slice(0, 9)
          .map(code => getDetail(code))
      )
  )
    .filter(res => res)
    .sort((a, b) => b.gszzl - a.gszzl)

  const foot =
    list.length === 9
      ? '\n(为了避免刷屏, 最多查询 9 条, 建议搜索词精确一些)'
      : ''

  let chichang = ''
  if (list.length === 1) {
    chichang = await getChiCang(list[0].fundcode)
  }

  // ${res.gszzl > 0 ? '📈' : res.gszzl === 0 ? '🔨' : '📉'}
  return (
    list
      .map(
        res =>
          `${res.fundcode} ${res.gszzl > 0 ? '+' : ''}${res.gszzl} ${res.name}`
      )
      .join('\n') +
      foot +
      chichang || '未找到该赌场'
  )
}

async function getFund(message) {
  return [
    {
      type: 'text',
      data: {
        text: await findFund(message)
      }
    }
  ]
}

module.exports = {
  getFund
}
