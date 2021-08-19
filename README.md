# go-cqhttp/node

> 基于 go-cqhttp 和 nodejs 的 qq 机器人

## 启动

- 在 https://github.com/Mrs4s/go-cqhttp/releases 下载对应平台的可执行文件, 放到 go-cqhttp 目录中

- 安装 nodejs 环境 (建议 12.0 以上版本), 根目录运行 `npm install` 安装依赖

- 运行 `go-cqhttp/下载的文件`, 根据提示填写 QQ 号和密码等信息, 参考文档 https://docs.go-cqhttp.org/guide/quick_start.html

- 根目录运行 `npm run dev`

## 插件

### 配置插件

在 `config.js` 中配置的插件才会被加载, 并且需要在插件目录运行 `npm install` 安装依赖

```js
// config.js
module.exports = {
  plugin: {
    // key: 可以是 npm 包名, 也可以是相对路径
    // value: 传给插件的配置对象 {}
    'path-to-plugin': {},
  },
}
```

### 内置插件

| 插件                      | 说明       |
| ------------------------- | ---------- |
| [almanac](plugin/almanac) | 黄历插件   |
| [blank](plugin/blank)     | 空白插件   |
| [chives](plugin/chives)   | 韭菜插件   |
| [dapan](plugin/dapan)     | 大盘插件   |
| [dog](plugin/dog)         | 舔狗日记   |
| [fund](plugin/fund)       | 基金查询   |
| [hot](plugin/hot)         | 热门词汇   |
| [mm](plugin/mm)           | 美女图片   |
| [qrcode](plugin/qrcode)   | 二维码     |
| [recall](plugin/recall)   | 消息防撤回 |
| [run-js](plugin/run-js)   | 运行 JS    |
| [stock](plugin/stock)     | 股票查询   |
| [weibo](plugin/weibo)     | 微博插件   |

### 开发插件

复制 [plugin/blank](plugin/blank), 参考其它插件和 https://docs.go-cqhttp.org 进行开发

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

## 其它

- [go-cqhttp/java](https://github.com/go-cqhttp/java) - qq 机器人 java 版
