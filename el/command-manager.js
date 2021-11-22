const { CommandExecutor } = require('./types')



const invoke = async ({ send, data, commands }, command, args) => {
    for (const cmd of Object.keys(commands)){
        if (command !== cmd) continue
        const context = commands[cmd]
        if (typeof context === 'object') { // 有分支指令
            if (args.length == 0){
                await send(`参数不足。可用参数: ${Object.keys(context)}`)
                return true
            }
            const [subcommand, ...subargs] = args
            return await invoke({ send, data, commands: context }, subcommand, subargs)
        } else if (typeof context === 'function'){
            const executor = new context()
            if (!(executor instanceof CommandExecutor)) {
                throw new Error('指令沒有繼承 CommandExecutor')
            }
            try {
                await executor.execute({ send, data }, args)
                return true
            }catch(err){
                console.error(`执行指令 ${cmd} 时出现错误: ${err?.message}`)
                console.error(err)
                await send(`执行时发生错误: ${err?.message ?? err}`)
                return true
            }
        }else{
            console.warn('未知指令类型, 已略过。')
        }
    }

    await send(`未知参数。可用参数: ${Object.keys(commands ?? {})}`)
    return false
}


module.exports = {
    invoke
}
