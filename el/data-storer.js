const { existsSync, mkdirSync, writeFileSync , promises: fs } = require('fs')


const PATH = './data/storage.json'

const caches = {
    data: {},
    cached: false
}


const DEFAULT_CONFIG = {
    "bot": {
        "http": "http://127.0.0.1:5700",
        "ws": "ws://127.0.0.1:6700"
    },
    "redis": {
        "host": "127.0.0.1",
        "port": 6379,
        "database": 0
    },
    "websocket": {
        "host": "localhost:8080",
        "use-tls": false
    },
    "source": "websocket",
    "owners": []
}


const DEFAULT_VALUES = {
    blive: {
        highlight: {
            '123': []
        },
        highlight_private: {
            '123': []
        },
        focus_users: {
            '123': []
        }
    }
}

// 新增 data 文件夹
if (!existsSync('./data')){
    mkdirSync('./data')
}


if (!existsSync('./data/settings.json')) {
    console.log("找不到 data/settings.json 档案")
    const config = JSON.stringify(DEFAULT_CONFIG, undefined, 4)
    writeFileSync('./data/settings.json', config)
    console.log("已新增默认的 data/settings.json 设定档。")
}


const write_transactions = []

const actions = {
    // this.update(data => { ... })
    update: async (update) => {
        const data = await actions.read()
        update(data)
        await actions.save(data)
    },

    save: async (data) => {
       write_transactions.push(JSON.stringify(data))
    },

    read: async () => {
        if (caches.cached){
            return caches.data
        }
        let data = {}
        if (existsSync(PATH)){
            data = JSON.parse(await fs.readFile(PATH))
        }
        caches.data = { ...DEFAULT_VALUES, ...data }
        return caches.data
    },

    clearCache(){
        caches.cached = false
    }
}


module.exports = actions


function isEmpty(o){
    return Object.keys(o).length == 0
}

setInterval(() => {
    const data = write_transactions.shift()
    if (!data) return
    try {
        writeFileSync(PATH, data)
        actions.clearCache()
        console.log(`离线数据储存已更新。`)
    }catch(err){
        console.warn(`执行离线储存时发生错误: ${err?.message ?? err}`)
        console.warn(err)
    }
}, 500)