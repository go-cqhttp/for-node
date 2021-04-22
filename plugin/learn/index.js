const fs = require("fs")
const os = require("os");
const path = require("path");

const service = require('./service')

const pattern = /^(Q)/i

function writeFile(filePath,content){
	fs.writeFileSync(filePath,content);
}

module.exports = options => {
  return async ({ data, ws, http }) => {
    if (!data.message) {
       return
    }
    if (pattern.test(data.message.trim())){
        writeFile('/usr/local/node/QA',data.message+'\n===========')
    }
    if (data.message_type === 'private') {
      ws.send('send_private_msg', {
        user_id: data.user_id,
        message: "Master 我先记下了，之后会学习的啦！"
      })
      return
    }
  }
}
