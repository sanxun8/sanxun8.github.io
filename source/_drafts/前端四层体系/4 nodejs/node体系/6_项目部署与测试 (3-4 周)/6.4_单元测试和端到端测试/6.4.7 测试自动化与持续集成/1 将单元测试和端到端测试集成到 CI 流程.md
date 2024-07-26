---
title: 将单元测试和端到端测试集成到 CI 流程
---

将单元测试和端到端测试集成到持续集成(CI)流程中的步骤如下:


## 选择 CI 工具:

常见的 CI 工具有 Jenkins、Travis CI、CircleCI、GitHub Actions 等。这里以 GitHub Actions 为例进行说明。

## 编写单元测试:

在项目中编写单元测试,涵盖各种功能场景。可以使用 Mocha、Jest 等测试框架。

## 编写端到端测试:

为了确保应用程序的端到端功能正常工作,需要编写端到端测试。可以使用 Selenium、Cypress 等工具来模拟用户操作。

## 创建 GitHub Actions 工作流:

在项目的 .github/workflows 目录下创建一个 YAML 文件,如 ci.yml。在这个文件中配置 CI 工作流:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

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
    - name: Run unit tests
      run: npm run test:unit
    - name: Run e2e tests
      run: npm run test:e2e
```

这个工作流在每次 push 或 pull request 时触发,运行单元测试和端到端测试。

## 配置测试脚本:

在 package.json 中添加测试脚本:

```json
"scripts": {
  "test:unit": "mocha 'test/unit/**/*.test.js'",
  "test:e2e": "cypress run"
}
```

test:unit 运行单元测试,test:e2e 运行端到端测试。

## 安装测试依赖:

安装单元测试和端到端测试所需的依赖:

```bash
npm install --save-dev mocha chai cypress
```

## 编写测试代码:

按照前面介绍的 TDD 流程,编写单元测试和端到端测试。

## 提交代码并观察 CI 结果:

提交代码到 GitHub 仓库,GitHub Actions 会自动触发 CI 流程,运行单元测试和端到端测试。可以在 GitHub 仓库的 Actions 标签页观察测试结果。

通过这种方式,您可以将单元测试和端到端测试完全集成到 CI 流程中。每次代码提交都会自动运行测试套件,及时发现和修复缺陷。这有助于提高代码质量,减少线上问题。

在实际项目中,您还可以进一步优化 CI 流程,如区分开发分支和主分支的测试策略、增加代码覆盖率检查、部署测试环境等。持续优化 CI/CD 流程是保证项目质量的关键。
