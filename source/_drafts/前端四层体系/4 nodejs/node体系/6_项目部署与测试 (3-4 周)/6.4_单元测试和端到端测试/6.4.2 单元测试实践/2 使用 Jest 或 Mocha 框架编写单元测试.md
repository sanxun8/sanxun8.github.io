---
title: 使用 Jest 或 Mocha 框架编写单元测试
---

下面以 Jest 和 Mocha 两个流行的 JavaScript 单元测试框架为例,展示如何编写单元测试:

## 使用 Jest 编写单元测试

安装 Jest:

```bash
npm install --save-dev jest
```

编写一个简单的函数 add.js:

```javascript
function add(a, b) {
  return a + b;
}

module.exports = add;
```

创建单元测试文件 add.test.js:

```javascript
const add = require('./add');

test('adds 1 + 2 to equal 3', () => {
  expect(add(1, 2)).toBe(3);
});
```

在 package.json 中添加测试脚本:

```json
{
  "scripts": {
    "test": "jest"
  }
}
```

运行测试:

```bash
npm test
```

输出结果:

```subunit
 PASS  ./add.test.js
  ✓ adds 1 + 2 to equal 3 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.172 s, estimated 1 s
Ran all test suites.
```

## 使用 Mocha 编写单元测试

安装 Mocha 和 Chai (断言库):

```bash
npm install --save-dev mocha chai
```

编写一个简单的函数 multiply.js:

```javascript
function multiply(a, b) {
  return a * b;
}

module.exports = multiply;
```

创建单元测试文件 multiply.spec.js:

```javascript
const chai = require('chai');
const expect = chai.expect;
const multiply = require('./multiply');

describe('multiply', () => {
  it('should multiply two numbers', () => {
    expect(multiply(2, 3)).to.equal(6);
  });
});
```

在 package.json 中添加测试脚本:

```json
{
  "scripts": {
    "test": "mocha *.spec.js"
  }
}
```

运行测试:

```bash
npm test
```

输出结果:

```submit
  multiply
    ✓ should multiply two numbers


  1 passing (6ms)
```

以上是使用 Jest 和 Mocha 两个流行的 JavaScript 单元测试框架编写单元测试的示例。两个框架都提供了丰富的断言库和测试功能,可以帮助开发者编写出高质量的单元测试。开发者可以根据项目需求和个人习惯选择使用哪个框架。
