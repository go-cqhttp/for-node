const boa = require('@pipcook/boa')
const path = require('path')
const os = require('os')
const { WordCloud } = boa.import('wordcloud')

const filename = path.join(os.tmpdir(), 'go-cqhttp-node-hot.png')

function createWordCloud(wordList) {
  const wc = new WordCloud(
    boa.kwargs({
      width: 1000,
      height: 1000,
      margin: 2,
      max_font_size: 100,
      background_color: 'white'
    })
  )
  wc.generate(wordList.join(','))
  wc.to_file(filename)
  return `file://${filename}`
}

module.exports = {
  createWordCloud
}
