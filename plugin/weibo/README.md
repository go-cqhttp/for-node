# weibo

> 微博插件

```js
module.exports = {
  plugin: {
    './plugin/weibo': {
      cookie: '现在要登录才能抓取了, 需要传入一个登录过微博的cookie'
    },
  },
}
```

用户发送 "微博/热搜/微博热搜/WB/RS/WBRS", 机器人抓取微博热搜 TOP10 返回

![image](https://user-images.githubusercontent.com/8413791/115984455-ba7a5e00-a5d9-11eb-98e0-acaaf96ee74e.png)

用户发送 "微博/热搜/微博热搜/WB/RS/WBRS 搜索词", 机器人返回微博搜索地址, 方便群友点击直达

![image](https://user-images.githubusercontent.com/8413791/115984463-c2d29900-a5d9-11eb-8d28-7f917d2f5cc7.png)
