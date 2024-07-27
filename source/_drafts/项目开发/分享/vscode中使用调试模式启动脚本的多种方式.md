---
title: vscode中使用调试模式启动脚本的多种方式
---

在 Visual Studio Code (VSCode) 中，有多种方式可以使用调试模式启动脚本。以下是几种常见的方法：

## 1. 使用 launch.json 配置文件

VSCode 通过 launch.json 配置文件来定义不同的调试配置。这是最常用的方法，可以详细配置调试选项。步骤如下：

**创建 launch.json 文件：**

开调试面板（侧边栏上的小虫子图标），点击齿轮图标，选择“添加配置”。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Program",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app.js",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

这个示例配置启动一个 Node.js 脚本。

**运行配置：**

在调试面板中选择刚才创建的配置，然后点击绿色的播放按钮。

## 2. 直接启动当前文件

VSCode 提供了快捷方式来直接调试当前打开的文件。步骤如下：

**打开你要调试的文件。**

按下 F5 键，VSCode 会尝试根据文件类型自动创建并运行一个调试配置。

## 3. 使用任务（Tasks）

你可以使用 VSCode 的任务系统来定义一些任务，然后结合 launch.json 使用。

步骤：

**创建 tasks.json 文件：**

在 .vscode 目录下创建 tasks.json 文件。

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "build",
      "type": "shell",
      "command": "tsc",
      "problemMatcher": ["$tsc"]
    }
  ]
}
```

**配置 launch.json 以在启动前运行任务：**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Program",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app.js",
      "preLaunchTask": "build"
    }
  ]
}
```

## 4. 使用 NPM Scripts

如果你使用 NPM 脚本来管理项目，你可以配置 launch.json 以运行特定的 NPM 脚本。

步骤：

**在 package.json 中定义一个脚本：**

```json
{
  "scripts": {
    "start": "node app.js"
  }
}
```

**配置 launch.json 以运行 NPM 脚本：**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch via NPM",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run-script", "start"],
      "port": 9229
    }
  ]
}
```

## 5. 使用插件

根据你使用的编程语言，VSCode 提供了大量插件来支持不同的调试功能。例如，Python 开发者可以使用 Python 插件。

步骤：

- 安装相关插件（如 Python 插件）。
- 插件通常会自动生成相应的 launch.json 配置文件。你也可以通过插件的文档找到具体的调试方法。

## 参考资料

- [VSCode 官方文档](https://code.visualstudio.com/docs/editor/debugging)
- [VSCode Launch Configurations](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations)
- [VSCode Tasks](https://code.visualstudio.com/docs/editor/tasks)
