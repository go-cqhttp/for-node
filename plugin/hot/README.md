# hot

> 热门词汇

执行以下命令, 初始化 sqlite 数据库

```bash
node init.js
```

```js
module.exports = {
  plugin: {
    './plugin/hot': {}
  }
}
```

根据群内当天聊天内容, 分析热门词汇, 机器人返回最热 TOP10 (原本是想做标签云图的, 以后有空再来实现)
