const axios = require('axios')
const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')
const { getCenter } = require('./util')
const shuiyin = require('./shuiyin')

const USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'

async function search(input) {
  try {
    let { data } = await axios({
      url: 'https://searchapi.eastmoney.com/api/Info/Search',
      params: {
        appid: 'el1902262',
        token: 'CCSDCZSDCXYMYZYYSYYXSMDDSMDHHDJT',
        type: 14,
        pageIndex14: 1,
        pageSize14: 9,
        and14: `MultiMatch/Name,Code,PinYin/${input}/true`,
        returnfields14:
          'Name,Code,PinYin,MarketType,JYS,MktNum,JYS4App,MktNum4App,ID,Classify,SecurityTypeName,SecurityType,IsExactMatch',
        isAssociation14: false,
        cb: 'jQuery18303842443576625214_1614045018334'
      },
      headers: {
        'User-Agent': USER_AGENT,
        Referer: 'https://wap.eastmoney.com/'
      }
    })
    data = JSON.parse(
      getCenter(data, 'jQuery18303842443576625214_1614045018334(', ')', true)
    )
    if (!data || !Array.isArray(data.Data)) {
      return []
    }
    return data.Data
  } catch (e) {
    console.error('[stock]', e)
    return []
  }
}

let mobilequotechart = ''

async function getDetail(key, typeName, title = '') {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setRequestInterception(true)
    page.on('request', async request => {
      try {
        if (request.url().includes('mobilequotechart.min.js')) {
          if (!mobilequotechart) {
            const { data } = await axios(request.url())
            // 去2次
            mobilequotechart = data
              .replace(shuiyin.before, shuiyin.after)
              .replace(shuiyin.before, shuiyin.after)
          }
          request.respond({
            status: 200,
            contentType: 'application/javascript',
            body: mobilequotechart
          })
          return
        }
      } catch (e) {
        console.error('[stock]', e)
      }
      request.continue()
    })
    await page.setUserAgent(USER_AGENT)
    await page.setViewport({
      width: 414,
      height: typeName === '基金' ? 600 - 14 : 600 - 90
    })
    await page.goto(`https://wap.eastmoney.com/quote/stock/${key}.html`)
    await page.addStyleTag({
      content: `
      #openinapp,
      [id*=pop],
      [id*=popup],
      [class*=pop],
      [class*=popup],
      [class*=dc],
      .icons-index-menu3,
      .icons-index-back,
      .wapfooter,
      .stock-footer,
      .otc-bottom,
      .otc-other,
      .icons-index-menu2,
      .icon-arrow-bottom,
      .otc-rate,
      #otc-chart-prd,
      #go-pc,
      .btn-more,
      #stock-infos-tabs,
      #stock-infos-list,
      #ad-header,
      .otc-right:before {
        display: none !important;
      }

      .comm-nav {
        top: 0 !important;
      }
      
      .stock-detail {
        padding-top: 0 !important;
      }
      
      body {
        padding-top: 43px !important;
      }
    `
    })
    await page.addScriptTag({
      content: `
      document.querySelector('.icons-index-back').parentNode.innerHTML = '${String(
        title
      ).replace(/'/g, '')}'
    `
    })
    // 象征性 等1秒
    try {
      if (typeName === '基金') {
        await page.waitForSelector('.otc-evaluation', { timeout: 1000 })
      }
    } catch (e) {}
    const screenshot = path.join(os.tmpdir(), `go-cqhttp-node-stock-${key}.png`)
    await page.screenshot({ path: screenshot })
    return 'file://' + screenshot
  } catch (e) {
    console.error('[stock]', e)
    return e.message || '未知错误'
  } finally {
    if (browser && process.env.NODE_ENV === 'production') {
      await browser.close()
    }
  }
}

async function getStock(input, options) {
  let [text, index] = input.split(/\s+/)
  if (!text) {
    return [
      {
        type: 'text',
        data: {
          text: [
            '[指令]',
            '股票/GP 代码/名称/拼音 索引',
            '',
            '[示例]',
            '股票 白酒',
            'GP 招商中证 7',
            'GP SXFJ'
          ].join('\n')
        }
      }
    ]
  }
  let output = await search(text)

  if (!output.length) {
    return [
      {
        type: 'text',
        data: {
          text: '未找到该赌场'
        }
      }
    ]
  }

  if (output.length === 1) {
    index = 1
  }

  let detail = ''
  if (index) {
    if (!output[index - 1]) {
      return [
        {
          type: 'text',
          data: {
            text: '索引不正确'
          }
        }
      ]
    }
    const target = output[index - 1]
    output = [target]
    detail = await getDetail(
      `${target.MktNum}.${target.Code}`,
      target.SecurityTypeName,
      options.title
    )
  }

  const foot =
    output.length === 9
      ? '\n(为了避免刷屏, 最多查询 9 条, 建议搜索词精确一些)'
      : ''

  const ret = [
    {
      type: 'text',
      data: {
        text:
          output
            .map(
              (item, index) =>
                `${output.length === 1 ? '' : `${index + 1} `}${
                  item.SecurityTypeName
                } ${item.Code} ${item.Name}`
            )
            .join('\n') + foot
      }
    }
  ]

  if (detail) {
    ret.push({
      type: 'text',
      data: {
        text: '\n\n'
      }
    })
    if (detail.startsWith('file://')) {
      ret.push({
        type: 'image',
        data: {
          file: detail
        }
      })
    } else {
      ret.push({
        type: 'text',
        data: {
          text: detail
        }
      })
    }
  }
  return ret
}

module.exports = {
  getStock
}
