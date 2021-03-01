# stock

> 股票查询插件: 可查询股票 / 基金 / 指数 / 板块等信息

由于本插件依赖 [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer), 在不同平台安装时, 请参考这个文档 https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

```js
module.exports = {
  plugin: {
    './plugin/stock': {
      // 股票图左上角文案
      title: '阿尔法猪'
    }
  }
}
```

用户发送 "股票/GP 代码/名称/拼音 索引", 机器人返回股票信息

![image1](https://user-images.githubusercontent.com/8413791/109466058-14601b00-7aa4-11eb-94a9-a996d6732e0f.png)

![image2](https://i.loli.net/2021/03/01/RCP4DrYvdh2jsAo.png)
