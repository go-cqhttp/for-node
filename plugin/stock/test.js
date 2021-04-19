const service = require('./service')

service.getStock('白酒 1', { title: '阿尔法猪' }).then(console.log)
