---
title: 6_PM2 与 Docker 集成
---

好的,让我为您介绍一下如何将 PM2 与 Docker 进行集成:

## 创建 Dockerfile:

在项目根目录创建一个 Dockerfile 文件,内容如下:

```dockerfile
FROM node:14-alpine

# 安装 PM2
RUN npm install -g pm2

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 安装依赖
RUN npm ci

# 启动应用程序
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--no-daemon"]
```


这个 Dockerfile 会:
- 使用 Node.js 14 alpine 镜像作为基础镜像
- 全局安装 PM2
- 设置工作目录为 /app
- 复制项目文件到容器中
- 安装项目依赖
- 使用 pm2-runtime 命令启动应用程序

## 配置 ecosystem.config.js:

在项目根目录创建一个 ecosystem.config.js 文件,用于配置 PM2:

```javascript
module.exports = {
  apps: [
    {
      name: 'my-app',
      script: 'app.js',
      instances: 'max',
      exec_mode: 'cluster'
    }
  ]
};
```


这个配置文件会启动名为 my-app 的应用程序,使用 app.js 作为入口文件,以集群模式运行,最大化利用可用的 CPU 核心。

## 构建和运行 Docker 镜像:

使用以下命令构建 Docker 镜像:

```
docker build -t my-app .
```

然后使用以下命令运行容器:

```
docker run -d -p 3000:3000 my-app
```

这将在后台启动容器,并将容器的 3000 端口映射到主机的 3000 端口。

通过这种方式,您可以将 PM2 与 Docker 无缝集成,实现应用程序的容器化部署。PM2 可以提供进程管理、负载均衡、监控等功能,而 Docker 则可以提供应用程序的打包和隔离。两者的结合可以大大提高应用程序的可靠性和可扩展性。

如果您有任何其他问题,欢迎继续询问。
