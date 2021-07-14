const service = require('./service')

service.getStock('神火股份', { title: '阿尔法猪' }).then(console.log)
