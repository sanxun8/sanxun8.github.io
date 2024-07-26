---
title: createRequire使用
---

createRequire 是 Node.js 提供的一个实用函数，用于在 ECMAScript 模块 (ESM) 中创建 CommonJS 模块的 require 函数。这个函数允许在 ESM 环境中使用 require 语句导入 CommonJS 模块，解决了 ESM 与 CommonJS 模块之间的互操作问题。

## 使用场景

- 在 ESM 环境中加载 CommonJS 模块。
- 加载 JSON 文件：虽然 ESM 支持静态导入 JSON，但在某些情况下，可能需要动态加载。
- 加载 Node.js 内置模块：例如，加载 path、fs 等内置模块。

## 使用示例

以下是如何在 ESM 中使用 createRequire：

**安装 Node.js 版本：**

需要 Node.js 版本 >= 12.2.0，因为 createRequire 是从这个版本开始支持的。

**导入和使用 createRequire：**

```javascript
// my-esm-module.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// 导入 CommonJS 模块
const fs = require("fs");
const someCjsModule = require("./some-cjs-module");

// 导入 JSON 文件
const packageJson = require("./package.json");

console.log(packageJson.name);
```

在上述示例中：

- 首先从 module 模块中导入 createRequire。
- 使用 createRequire(import.meta.url) 创建一个 require 函数，这个函数可以像在 CommonJS 环境中一样使用。
- 使用 require 导入 CommonJS 模块、内置模块和 JSON 文件。

## 详细说明

**createRequire 方法：**

```javascript
import { createRequire } from "module";
const require = createRequire(import.meta.url);
```

import.meta.url 用于传递当前模块的 URL，确保 require 函数在当前模块的上下文中正常工作。

**加载模块：**

```javascript
const fs = require("fs"); // 加载 Node.js 内置模块
const lodash = require("lodash"); // 加载第三方模块
const customModule = require("./custom-cjs-module"); // 加载自定义 CommonJS 模块
const data = require("./data.json"); // 加载 JSON 文件
```

## 常见问题

**为什么要使用 createRequire：**

在 ESM 中，import 语句是静态的，不支持动态加载。而 require 是动态的，可以在代码运行时根据条件加载模块。因此，在某些需要动态加载模块的情况下，createRequire 是非常有用的。

**兼容性：**

虽然 ESM 是未来的模块标准，但许多现有的 Node.js 生态系统模块仍然是以 CommonJS 格式编写的。createRequire 提供了一种过渡方案，使得开发者能够逐步迁移到 ESM，同时保持与现有模块的兼容性。

## 参考资料

- Node.js Documentation: createRequire
- [MDN Web Docs: import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)
- ECMAScript Modules in Node.js
