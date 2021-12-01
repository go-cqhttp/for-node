# Vup Monitors

基于 go-cqhttp 和 nodejs 的 Vups 直播間監控機器人 

## 前置

- [go-cqhttp](https://github.com/Mrs4s/go-cqhttp/) (QQ机器人)
- [biligo-live-ws](https://github.com/eric2788/biligo-live-ws) (B站直播间 WS 监控)

## 启动

### go-cqhttp

- 在 https://github.com/Mrs4s/go-cqhttp/releases 下载对应平台的可执行文件

- 运行 `go-cqhttp`, 根据提示填写 QQ 号和密码等信息, 参考文档 https://docs.go-cqhttp.org/guide/quick_start.html

### biligo-live-ws

- 在 https://github.com/eric2788/biligo-live-ws/releases 下载对应平台的可执行文件

- 运行程序

### 本项目 (Vup_monitors)

- 下载对应平台的可执行文件

- 运行程序后关闭

- 到 `data/settings.json` 填入设定，包括
    - 设定数据源 `source` 为 `websocket`
    - 在管理员 `owners` 的设定中添加你的 QQ 号

- 再运行程序


#### 除了 biligo-live-ws 以外的运行方式

- [blive-redis-server](https://github.com/eric2788/blive-redis-server) + [redis](https://www.redis.com.cn/redis-installation.html) 伺服器 (比较麻烦)

    运行 blive-redis-server 和 redis，然后在 `data/settings.json` 设定数据源为 `redis` 即可 

## 其他部署方式

### Docker

详见 Dockerfile

## 鸣谢

详见 forked from
