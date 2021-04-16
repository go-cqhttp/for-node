async function getFlash(http, message) {
  try {
    const file = message.match(/type=flash,file=(.*?)\.image/).pop()
    console.log('[flash] file', file)
    const { data } = await http.send('get_image', { file: `${file}.image` })
    console.log('[flash] data', data)
    return [
      {
        type: 'image',
        data: {
          file: data.url,
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
