const { invoke } = require('./el/command-manager')
const readline = require("readline");
const { connect } = require('./el/redis_api');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const group_id = 123456 // 测试

function input(str = '') {
    return new Promise((resolve, reject) => {
        rl.question(str, (input) => resolve(input) );
    });
}

async function testCommands(){
    // eslint-disable-next-line no-constant-condition
    while (true){
        const msg = await input('Enter command: ')
        if (msg === '!exit'){
            break
        }
        if (msg[0] !== '!'){
            console.log('指令必须以 ! 开头')
            continue
        }
        const command = msg.substring(1).split(' ')
        const [cmd, ...args] = command

        try {
            const result = await invoke({
                send: (msg) => console.log(`发送讯息: ${msg}`),
                data: { group_id }
            }, cmd, args)
            console.log(result ? '执行成功' : '没有此指令')
        }catch(err){
            console.error(err)
        }
    }
}

async function test(){
    await connect()
    await testCommands()
}


test().catch(console.error)
