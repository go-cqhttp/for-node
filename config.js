const { CommandExecutor } = require('./el/types')

// commands
const blive = require('./commands/blive')
const highlights = require('./commands/highlights')
const focus = require('./commands/focus')

// ws handles
const danmu_msg = require('./ws_handles/dammu_msg')
const room_enter = require('./ws_handles/room_enter')
const superchat_msg = require('./ws_handles/superchat_msg')
const live_broadcast = require('./ws_handles/live_broadcast')

class Help extends CommandExecutor {

  async execute({ send, data }, args) {

      await send(`可用指令: ${Object.keys(module.exports.commands).map(s => `!${s}`)}`)

  }
}


module.exports = {
  plugin: {
    './plugin/commands': {}
  },
  commands: {
    'B站直播': blive,
    '高亮': highlights,
    '注视': focus,
    'help': Help
  },
  ws_handles: {
    'DANMU_MSG': danmu_msg,
    'LIVE': live_broadcast,
    'SUPER_CHAT_MESSAGE': superchat_msg,
    'INTERACT_WORD': room_enter
  }
}
