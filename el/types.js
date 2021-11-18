class CommandExecutor {

    constructor(){
        if (this.constructor === CommandExecutor){
            throw new Error('not implemented')
        }
    }
    
    async execute({ send, data }, args){
        throw new Error('not implemented')
    }

}

module.exports = {
    CommandExecutor
}

