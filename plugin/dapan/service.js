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
      // http://sdc.jrj.com.cn/dcs0kbnws6cwv3t3c80mwlr23_8j4c/dcs.gif?dcsredirect=1&dcsdat=1647933490141&dcssip=summary.jrj.com.cn&dcsuri=/dpyt/&WT.tz=8&WT.bh=15&WT.ul=zh-CN&WT.cd=30&WT.sr=1536x960&WT.jo=No&WT.ti=%u5927%u76D8%u4E91%u56FE-%u884C%u60C5%u4E2D%u5FC3-%u91D1%u878D%u754C&WT.fi=No&WT.co_f=287052a4391d7fc08b51647933490142&WT.vt_f=1&WT.vt_f_a=1&WT.vt_f_s=1&WT.vt_f_d=1&WT.vt_sid=287052a4391d7fc08b51647933490142.1647933490142
      if (request.url().includes('http://sdc.jrj.com.cn/')) {
        request.abort()
      } else {
        request.continue()
      }
    })
    await page.goto(`http://summary.jrj.com.cn/dpyt/`)
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
// setInterval(() => getData(), 1000 * 30)

module.exports = {
  handler,
}
