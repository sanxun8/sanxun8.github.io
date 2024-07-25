---
title: 手搓一个vue框架
---

作为 vue 框架的使用者，当我调用 vue 提供的 api 的时候，时常对其实现和细节充满好奇。但当我对各模块深入学习后，任然无法对所学知识形成串联，于是乎，有必要手搓一个 vue 框架了。

我们知道， vue 是一个视图层框架，当我们设计一个框架的时候，框架本身的各个模块之间并不是相互独立的，而是相互关联、相互制约的。因此作为框架设计者，一定要对框架的定位和方向拥有全局的把控，这样才能做好后续的模块设计和拆分。

在深入实现 vue 各模块之前，我们也应该从全局的角度对框架的设计拥有清晰的认知，否则很容易被细节困住，看不清全貌。

## 命令式和声明式

首先，我们先搭建一个跟传统 vue 项目相似的目录结构

```
├── src
|   ├── main.js
```

<!-- ```javascript
import App from './app.vue';

createApp(App).mount('#app');
``` -->

我们从入口文件 mai.js 出发，我们可以很容易想到， main.js 需要实现对首屏的渲染。

```javascript
const root = document.createElement('div');

root.textContent = '这是首屏';
document.body.append(root);
```

如此编写程序会两个缺点，第一是直接在入口文件进行逻辑编写会造成入口文件的臃肿，第二是跟我们传统 vue 项目书写风格不符。

首先解决文件臃肿的方式很简单，我们把相关逻辑抽离出去。

```javascript
function render() {
  const root = document.createElement('div');

  root.textContent = '这是首屏';
  document.body.append(root);
}
```

然后入口文件只需要执行 render 函数即可

```javascript
render();
```

再来说一下第二点，从范式的角度讲， 我们上面所书写是命令式风格的代码，而 vue 框架是一个声明式风格框架。我们往往会书写如下形式的代码

```html
<template>
  <div>这是首屏</div>
</template>
```

## template 编译实现

将 template 语法转化为可执行文件的过程即为编译。vue 的编译跟 Babel 的转换流程,包括 Parsing、Transforming 和 Generating 三个主要步骤。

为了简化学习成本，我们直接套公式简单实现一下该过程。

```javascript
function compile(template) {
  const ast = baseParse(template);
  transform(ast);
  return generate(ast);
}
```




