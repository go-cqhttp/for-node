async function getRecall(http, message_id) {
  try {
    const { data } = await http.send('get_msg', { message_id })
    return data.message
  } catch (e) {
    console.error('[recall]', e)
    return null
  }
}

module.exports = {
  getRecall,
}
