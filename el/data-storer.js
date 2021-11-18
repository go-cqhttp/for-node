const { existsSync, promises: fs } = require('fs')


const PATH = './data/storage.json'

const caches = {
    data: {},
    cached: false
}

const DEFAULT_VALUES = {
    blive: {
        highlight: {
            '123': []
        },
        listenings: []
    }
}

const actions = {
    // this.update(data => { ... })
    update: async (update) => {
        const data = await actions.read()
        update(data)
        await actions.save(data)
    },

    save: async (data) => {
        await fs.writeFile(PATH, JSON.stringify(data))
        actions.clearCache()
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