# go-cqhttp/node

> 基于 go-cqhttp 和 nodejs 的 qq 机器人

## 启动

- 在 https://github.com/Mrs4s/go-cqhttp/releases 下载可执行文件, 放到 go-cqhttp 目录中

- 安装 nodejs 环境 (建议 12.0 以上版本), 根目录执行 `npm install` 安装依赖

- 运行 `go-cqhttp/下载的文件`, 根据提示填写 QQ 号和密码等信息, 参考文档 https://docs.go-cqhttp.org/guide/quick_start.html

- 根目录执行 `npm start`, 参考文档 https://docs.go-cqhttp.org 进行开发

## 插件

## 插件使用

```bash
npm install 插件
```

```js
// config.js
module.exports = {
  plugin: {
    插件: {}, // 插件配置
    // 如果你的插件是私有的 (未发布到 npm 或 github), 也可以使用相对路径
    './your-plugin': {}
  }
}
```

### 插件列表

| 名称     | 插件                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 舔狗日记 | [go-cqhttp/node-plugin-dog](https://github.com/go-cqhttp/node-plugin-dog) |

### 插件编写

```js
/**
 * @param options 机器人传给插件的配置
 */
module.exports = options => {
  /**
   * @param data 收到的消息
   * @param ws 机器人 WebSocket 实例
   * @param http 机器人 HTTP 实例
   */
  return async ({ data, ws, http }) => {
    // TODO:
  }
}
```
