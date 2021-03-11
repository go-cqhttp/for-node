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
    './plugin/hot': {
      // 过滤某些 QQ 号, 不参与生成词云图
      filterUserId: [],
      // 过滤某些词, 不参与生成词云图
      filterWord: list => {
        // 可自定义过滤方式
        return list
      }
    }
  }
}
```

根据群内当天聊天内容, 生成词云图

![6F185434977A14106ACB50CF66C7050B](https://user-images.githubusercontent.com/8413791/110626148-55120f80-81db-11eb-869c-289399d92e09.png)
