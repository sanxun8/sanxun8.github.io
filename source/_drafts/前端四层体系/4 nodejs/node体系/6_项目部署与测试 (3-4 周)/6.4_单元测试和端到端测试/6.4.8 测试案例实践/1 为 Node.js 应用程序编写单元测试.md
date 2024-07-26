---
title: 为 Node.js 应用程序编写单元测试
---

为 Node.js 应用程序编写单元测试的步骤如下:


## 选择测试框架:

常用的 Node.js 测试框架有 Mocha、Jest、Ava 等。这里以 Mocha 为例进行说明。

## 安装测试框架:

```bash
npm install --save-dev mocha
```

## 编写测试用例:

在 test 目录下创建测试文件,例如 test/example.test.js:

```javascript
const assert = require('assert');
const example = require('../src/example');

describe('Example', () => {
  describe('add function', () => {
    it('should add two numbers', () => {
      const result = example.add(2, 3);
      assert.equal(result, 5);
    });

    it('should handle negative numbers', () => {
      const result = example.add(-2, 3);
      assert.equal(result, 1);
    });
  });

  describe('subtract function', () => {
    it('should subtract two numbers', () => {
      const result = example.subtract(5, 3);
      assert.equal(result, 2);
    });
  });
});
```

在上述示例中:

- 导入待测试的 example 模块
- 使用 describe 定义测试套件
- 使用 it 定义测试用例
- 使用 assert 断言测试结果

## 编写被测试代码:

在 src 目录下创建 example.js 文件,实现 add 和 subtract 函数:

```javascript
exports.add = function(a, b) {
  return a + b;
};

exports.subtract = function(a, b) {
  return a - b;
};
```

## 运行测试:

在 package.json 的 scripts 中添加测试命令:

```json
"scripts": {
  "test": "mocha 'test/**/*.test.js'"
}
```

然后运行 npm test 执行测试。

## 持续集成:

在 GitHub Actions 等 CI 工具中添加测试步骤,确保每次提交都能自动运行测试:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
      - run: npm ci
      - run: npm test
```

以上就是为 Node.js 应用程序编写单元测试的基本步骤。

一些补充说明:

- 编写测试用例时,要覆盖各种场景,包括正常情况、边界情况、异常情况等。
- 可以使用 before、after、beforeEach、afterEach 等钩子函数管理测试用例的生命周期。
- 除了 assert,还可以使用 should.js、chai 等断言库提供更丰富的断言语法。
- 测试框架还提供并行运行、代码覆盖率统计等高级功能,可以根据项目需求进行配置。
- 单元测试是持续集成和持续部署的基础,务必将其作为开发流程的一部分。
