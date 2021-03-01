function getCenter(text, left, right, last = false) {
  const leftIndex = text.indexOf(left) + left.length
  const rightIndex = text[last ? 'lastIndexOf' : 'indexOf'](right, leftIndex)
  return text.slice(leftIndex, rightIndex)
}

module.exports = {
  getCenter
}
