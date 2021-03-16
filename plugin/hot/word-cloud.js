const boa = require('@pipcook/boa')
const path = require('path')
const os = require('os')
const Segment = require('segment')

const { WordCloud } = boa.import('wordcloud')
const font_path = path.join(__dirname, 'FZLTHJW.TTF')
const segment = new Segment()
segment.useDefault()

function getWord(text, filterWord) {
  try {
    text = text.replace(/\[CQ:.*?\]/gim, '')
    if (!text) return ''

    let wordList = segment.doSegment(text, {
      stripPunctuation: true
    })
    wordList = wordList.map(item => item.w)
    if (typeof filterWord === 'function') {
      wordList = filterWord(wordList)
    }
    return wordList.join(',')
  } catch (e) {
    console.error('[word-cloud]', e)
    return ''
  }
}

function getImage(wordList) {
  const wc = new WordCloud(
    boa.kwargs({
      font_path,
      width: 1000,
      height: 1000,
      margin: 2,
      max_font_size: 300,
      background_color: 'black',
      collocations: false
    })
  )
  wc.generate(wordList.join(','))
  const filename = path.join(
    os.tmpdir(),
    `go-cqhttp-node-hot-${Date.now()}.png`
  )
  wc.to_file(filename)
  // console.log(filename)
  return `file://${filename}`
}

module.exports = {
  getWord,
  getImage
}
