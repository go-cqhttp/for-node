# Vup Monitors

基于 go-cqhttp 和 nodejs 的 Vups 直播間監控機器人 

## 前置

- Redis 服务器 (用于 订阅/发布)
- [go-cqhttp](https://github.com/Mrs4s/go-cqhttp/) (QQ机器人)
- [blive-redis-server](https://github.com/eric2788/blive-redis-server) (B站直播间 WS 监控)

## 启动

### Redis

- 启动 Redis 服务器

### Go-Cqhttp

- 在 https://github.com/Mrs4s/go-cqhttp/releases 下载对应平台的可执行文件

- 运行 `go-cqhttp`, 根据提示填写 QQ 号和密码等信息, 参考文档 https://docs.go-cqhttp.org/guide/quick_start.html

### Blive-Redis-Server

- 下载 python 运行环境

- 在 https://github.com/eric2788/blive-redis-server 下载源码

- 在设定档 (settings/config.json) 填入 Redis 连线资料

- 输入 `python main.py` 运行程序

### 本项目 (Vup_monitors)

- 安装 nodejs 环境 (14.0 以上版本)

- 下载本项目源码

- 在设定档 (data/settings.json) 填入 Redis 连线资料 及 go-cqhttp 的连线资料

- 根目录双击 start.bat 运行 (windows 部署)

## 其他部署方式

### Docker

详见 Dockerfile

### Linux

- 安装 nodejs 环境 (14.0 以上版本), 根目录运行 `npm install` 安装依赖

- 在设定档 (data/settings.json) 填入 Redis 连线资料 及 go-cqhttp 的连线资料

- 根目录使用 `npm run start` 指令运行程序

## 鸣谢

详见 forked from
