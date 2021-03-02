# go-cqhttp/node

> 基于 go-cqhttp 和 nodejs 的 qq 机器人

## 启动

- 在 https://github.com/Mrs4s/go-cqhttp/releases 下载对应平台的可执行文件, 放到 go-cqhttp 目录中

- 安装 nodejs 环境 (建议 12.0 以上版本), 根目录运行 `npm install` 安装依赖

- 运行 `go-cqhttp/下载的文件`, 根据提示填写 QQ 号和密码等信息, 参考文档 https://docs.go-cqhttp.org/guide/quick_start.html

- 根目录运行 `npm run dev`

## 插件

### 配置插件

```js
// config.js
module.exports = {
  plugin: {
    // key: 可以是 npm 安装的全局包名, 也可以是相对路径
    // value: 传给插件的配置对象 {}
    'path-to-plugin': {}
  }
}
```

### 内置插件

- 没有配置的插件, 不会加载
- 需要用到的插件, 请到插件目录 `npm install` 安装相关依赖

| 插件                    | 说明     |
| ----------------------- | -------- |
| [blank](plugin/blank)   | 空白项目 |
| [dog](plugin/dog)       | 舔狗日记 |
| [fund](plugin/fund)     | 基金查询 |
| [mm](plugin/mm)         | 美女图片 |
| [qrcode](plugin/qrcode) | 二维码   |
| [run-js](plugin/run-js) | 运行 JS  |
| [stock](plugin/stock)   | 股票查询 |

### 开发插件

复制 [plugin/blank](plugin/blank) 空白项目, 参考文档 https://docs.go-cqhttp.org 进行开发

```js
/**
 * @param options 传给插件的配置
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

## 部署 (Linux)

- 安装 screen 工具后: 后台运行 `go-cqhttp/下载的文件` (screen 命令用法自行搜索)

- 安装 pm2 工具后: 在根目录运行 `npm start`

- 代码更新: 在根目录运行 `npm run reload`

> 因为 go-cqhttp 登录需要交互操作, 而 pm2 不支持, 所以这里用 screen 运行 go-cqhttp, 你也可以用其它方法后台运行
