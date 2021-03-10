# hot

> 热门词汇

初始化 sqlite 数据库

```bash
node init.js
```

安装 wordcloud 库

```bash
npx bip install wordcloud
```

配置插件

```js
module.exports = {
  plugin: {
    './plugin/hot': {}
  }
}
```

根据群内当天聊天内容, 生成词云图
