# run-js

> 运行 JS 插件

```js
module.exports = {
  plugin: {
    './plugin/run-js': {
      // 运行超时毫秒数 (不填默认为: 1000 * 10)
      timeout: 1000 * 10,
      // 可定义全局方法或常量
      sandbox: {
        sayHello: value => `hello, ${value}`
      }
    }
  }
}
```

用户发送 "JS 代码", 机器人返回运行结果

- 同步代码将返回最后一个表达式的值
- 异步代码可使用 callback('返回值')

![run-js](https://user-images.githubusercontent.com/8413791/109463542-25a72880-7aa0-11eb-918f-79558d00aa2c.png)
