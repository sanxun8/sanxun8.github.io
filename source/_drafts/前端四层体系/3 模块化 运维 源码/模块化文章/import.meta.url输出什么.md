---
title: import.meta.url输出什么
---

在 JavaScript 中，import.meta.url 是一个特殊的元属性，用来获取当前模块的 URL。这个属性在 ES6 模块（也称为 ES 模块或 ECMAScript 模块）环境中非常有用，尤其是在现代浏览器和 Node.js 中。

## import.meta.url 的输出

当你在一个模块中使用 import.meta.url，它会返回一个字符串，表示该模块的绝对 URL。这在不同的环境中会有所不同：

**在浏览器中：**

在浏览器中，import.meta.url 返回包含模块位置的完整 URL。

```javascript
// 假设在浏览器中运行，文件路径为 /path/to/module.js
console.log(import.meta.url);
// 输出: http://localhost/path/to/module.js
```

**在 Node.js 中：**

在 Node.js 中，import.meta.url 返回模块文件的 file: URL。

```javascript
import { fileURLToPath } from "url";

// 在 Node.js 中运行，文件路径为 /path/to/module.mjs
console.log(import.meta.url);
// 输出: file:///path/to/module.mjs

// 将 URL 转换为文件路径
const filePath = fileURLToPath(import.meta.url);
console.log(filePath);
// 输出: /path/to/module.mjs
```

## 实用场景

- 动态加载资源：根据模块的位置动态加载其他资源文件（如 JSON、图像等）。
- 文件路径操作：在 Node.js 中，将模块的 URL 转换为文件路径，以便进行文件系统操作。
- 调试和日志记录：在调试或记录日志时，可以使用 import.meta.url 提供模块的位置信息。

## 示例

**浏览器中使用**

```javascript
// module.js
console.log(import.meta.url);

// 输出: http://localhost/path/to/module.js
```

**Node.js 中使用**

```javascript
// module.mjs
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const **filename = fileURLToPath(import.meta.url);
const **dirname = dirname(\_\_filename);

console.log(\_\_filename);
// 输出: /path/to/module.mjs

console.log(\_\_dirname);
// 输出: /path/to
```

使用 import.meta.url 可以帮助开发者更好地理解和处理模块的上下文，特别是在涉及文件系统操作或需要确定模块位置的场景下。

## 参考资料

- [MDN Web Docs on import.meta](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta)
- Node.js Documentation on ECMAScript Modules
