const { VM } = require('vm2')

function handleOutput(output) {
  let o = String(output)
  if (o.length === 0) {
    return '运行结果为空'
  }

  if (o.length < 1000) {
    return o
  }

  return o.slice(0, 1000) + '\n(为了避免刷屏, 仅显示前 1000 字符)'
}

function runJs(input, options) {
  return new Promise(resolve => {
    const myResolve = output => {
      resolve([
        {
          type: 'text',
          data: {
            text: handleOutput(output)
          }
        }
      ])
    }
    try {
      const code = input
        .replace(/^JS\s+/i, '')
        .replace(/&#91;/g, '[')
        .replace(/&#93;/g, ']')
        .replace(/&amp;/g, '&')
      const vm = new VM({
        timeout: options.timeout || 1000 * 10,
        sandbox: options.sandbox || {}
      })
      const hasCallback = code.includes('callback(')
      const result = vm.run(
        hasCallback ? `(function (callback) { ${code} })` : code
      )
      if (typeof result === 'function' && hasCallback) {
        result(myResolve)
      } else {
        myResolve(result)
      }
    } catch (e) {
      // console.error('[run-js]', e)
      myResolve(e.message)
    }
  })
}

module.exports = {
  runJs
}
