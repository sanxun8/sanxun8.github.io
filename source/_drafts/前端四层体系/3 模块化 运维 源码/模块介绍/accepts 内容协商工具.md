---
title: accepts
---

accepts 是一个用于处理 HTTP 请求中 Accept 头的 Node.js 模块。它可以帮助你根据客户端的请求头确定响应的内容类型、语言、字符集和编码。以下是如何使用 accepts 模块的指南。

## 常用方法

- accept.type 获取客户端可接受的 MIME 类型
- accept.language 获取客户端可接受的语言
- accept.charset 获取客户端可接受的编码

## 基于 negotiator

对 negotiator 改动如下

- 扩展导出函数
- 标准化参数
- 标准化函数返回值

## 以 encodings 为例

```javascript
var Negotiator = require("negotiator");
function Accepts(req) {
  if (!(this instanceof Accepts)) {
    return new Accepts(req);
  }

  this.headers = req.headers;
  this.negotiator = new Negotiator(req);
}

// 扩展导出函数
Accepts.prototype.encoding = Accepts.prototype.encodings = function (
  encodings_
) {
  var encodings = encodings_;

  if (encodings && !Array.isArray(encodings)) {
    // 标准化参数
    encodings = new Array(arguments.length);
    for (var i = 0; i < encodings.length; i++) {
      encodings[i] = arguments[i];
    }
  }

  if (!encodings || encodings.length === 0) {
    return this.negotiator.encodings(); // 标准化函数返回值
  }

  return this.negotiator.encodings(encodings)[0] || false; // 标准化函数返回值
};
```
