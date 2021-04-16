async function getFlash(http, message) {
  try {
    const file = message.match(/type=flash,file=(.*?)\.image/).pop()
    const { data } = await http.send('get_image', { file: `${file}.image` })
    return [
      {
        type: 'text',
        data: {
          text: `[闪照图片地址]\n${data.url}`,
        },
      },
    ]
  } catch (e) {
    console.error('[flash]', e)
    return null
  }
}

module.exports = {
  getFlash,
}
