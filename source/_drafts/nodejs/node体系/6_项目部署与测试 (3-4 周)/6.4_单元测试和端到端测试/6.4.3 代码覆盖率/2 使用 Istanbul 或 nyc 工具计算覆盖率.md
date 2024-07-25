---
title: 使用 Istanbul 或 nyc 工具计算覆盖率
---

使用 Istanbul 或 nyc 工具计算代码覆盖率的步骤如下:


## 安装工具

- Istanbul: 运行 npm install istanbul --save-dev 安装 Istanbul
- nyc: 运行 npm install nyc --save-dev 安装 nyc

## 配置工具

### Istanbul:

在 package.json 文件中添加以下脚本:

```json
"scripts": {
  "test": "istanbul cover _mocha"
}
```

或者在命令行中运行: istanbul cover _mocha

### nyc:

在 package.json 文件中添加以下脚本:

```json
"scripts": {
  "test": "nyc mocha"
}
```

或者在命令行中运行: nyc mocha

## 运行测试

运行 npm test 来执行测试并生成覆盖率报告。

## 查看报告

- 运行测试后,你会在项目目录下看到一个 coverage 目录,里面包含了覆盖率报告。
- Istanbul:
  - 打开 coverage/index.html 文件,你可以在浏览器中查看详细的覆盖率报告。
- nyc:
  - 运行 nyc report --reporter=html 生成 HTML 格式的报告,然后打开 coverage/index.html 文件查看。
  
除了生成 HTML 报告,这两个工具还支持其他格式的报告,如 text、lcov 等。你可以根据需要选择合适的报告格式。

使用这些工具可以很方便地在项目中集成代码覆盖率测量,帮助你了解测试的充分性,并在持续集成/部署流程中监控代码质量。
