const puppeteer = require('puppeteer')
const path = require('path')
const os = require('os')

const screenshot = path.join(os.tmpdir(), `go-cqhttp-node-dapan.png`)

async function getData() {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setViewport({
      width: 1000,
      height: 900,
    })
    await page.setRequestInterception(true)
    page.on('request', request => {
      if (request.resourceType() === 'image') request.abort()
      else request.continue()
    })
    await page.goto(`http://summary.jrj.com.cn/dpyt/`, {
      waitUntil: 'domcontentloaded'
    })
    await page.addStyleTag({
      content: `
        .header,
        body > :not(.main),
         .stock_inf,
         .jrj-where,
         .scgl_s1,
         .map_bt,
          .main > .mt,
          iframe {
          display: none !important;
        }

        .main,
        .chart {
          margin: 0 !important;
        }
      `,
    })
    await page.waitForSelector('.chart')
    const chart = await page.$('.chart')
    await chart.screenshot({ path: screenshot })
    return [
      {
        type: 'image',
        data: {
          file: 'file://' + screenshot,
        },
      },
    ]
  } catch (e) {
    console.error('[dapan]', e)
    return [
      {
        type: 'text',
        data: {
          text: e.message || '未知错误',
        },
      },
    ]
  } finally {
    if (browser && process.env.NODE_ENV === 'production') {
      await browser.close()
    }
  }
}

async function handler({ message }) {
  const key = message.trim()
  if (!['大盘', 'DP'].includes(key.toUpperCase())) {
    return
  }

  // 永远返回缓存
  return [
    {
      type: 'image',
      data: {
        file: 'file://' + screenshot,
      },
    },
  ]
}

// 后台自动抓
getData()
setInterval(() => getData(), 1000 * 60)

module.exports = {
  handler,
}
