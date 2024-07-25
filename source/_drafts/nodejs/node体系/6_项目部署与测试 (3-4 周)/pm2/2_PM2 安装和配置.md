---
title: 第2课: PM2 安装和配置
---

1. 在 Windows 上安装 PM2
   - 打开命令提示符或 PowerShell
   - 运行命令 npm install -g pm2 全局安装 PM2
   - 检查 PM2 是否安装成功: pm2 --version
2. 在 macOS/Linux 上安装 PM2
   - 打开终端
   - 运行命令 sudo npm install -g pm2 全局安装 PM2
   - 检查 PM2 是否安装成功: pm2 --version
3. 配置 PM2 环境变量
   - PM2 会自动在系统启动时启动,但您也可以手动配置它
   - 在 Windows 上,添加 C:\Users\YourUsername\.pm2\pm2.exe 到系统 PATH 环境变量
   - 在 macOS/Linux 上,将 ~/.pm2/bin 添加到 PATH 环境变量
4. 设置 PM2 开机自启
   - 在 Windows 上,使用 pm2 startup 命令添加 PM2 开机自启
   - 在 macOS/Linux 上,使用 pm2 startup systemd 命令添加 PM2 开机自启
5. 配置 PM2 选项
   - PM2 的配置文件位于 ~/.pm2/ecosystem.config.js
   - 您可以在此文件中设置应用程序的启动参数、环境变量等
   
安装和配置完成后,我们就可以开始学习 PM2 的基本命令了。请继续关注下一课。