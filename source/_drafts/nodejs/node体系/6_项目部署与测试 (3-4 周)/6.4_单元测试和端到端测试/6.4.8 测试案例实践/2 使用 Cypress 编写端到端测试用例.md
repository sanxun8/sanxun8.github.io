---
title: 使用 Cypress 编写端到端测试用例
---

使用 Cypress 编写端到端测试用例的步骤如下:


## 安装 Cypress:

首先需要安装 Cypress 依赖:

```bash
npm install --save-dev cypress
```

## 创建测试用例:

在项目根目录下创建 cypress 目录,并在 cypress/integration 目录下创建测试文件,例如 login.spec.js:

```javascript
describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('http://example.com/login')
    cy.get('#username').type('testuser')
    cy.get('#password').type('testpassword')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, testuser').should('be.visible')
  })

  it('should show error message for invalid credentials', () => {
    cy.visit('http://example.com/login')
    cy.get('#username').type('invaliduser')
    cy.get('#password').type('invalidpassword')
    cy.get('button[type="submit"]').click()
    cy.contains('Invalid username or password').should('be.visible')
  })
})
```

在上述示例中:

- 使用 cy.visit() 打开 URL
- 使用 cy.get() 选择 DOM 元素
- 使用 cy.type() 输入文本
- 使用 cy.click() 模拟点击
- 使用 cy.url() 和 cy.contains() 断言页面行为

## 配置 Cypress:

在项目根目录下创建 cypress.json 文件,配置 Cypress 的行为:

```json
{
  "baseUrl": "http://example.com",
  "viewportWidth": 1280,
  "viewportHeight": 720
}
```

## 运行测试:

在 package.json 的 scripts 中添加测试命令:

```json
复制
"scripts": {
  "test:e2e": "cypress run"
}
```

然后运行 npm run test:e2e 执行端到端测试。

## 开发模式:

Cypress 还提供了开发模式,可以在浏览器中实时查看测试运行过程:

```bash
npx cypress open
```

这会打开 Cypress 的GUI,您可以在其中选择要运行的测试文件。

## 持续集成:

在 GitHub Actions 等 CI 工具中添加端到端测试步骤:

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
      - run: npm run test:e2e
```      
      
以上就是使用 Cypress 编写端到端测试用例的基本步骤。

一些补充说明:

- Cypress 支持测试 Web 应用、移动应用、API 等,可以全面覆盖应用程序的端到端功能。
- 可以使用 cy.get()、cy.contains()、cy.click()、cy.type() 等命令操作 DOM 元素。
- 可以使用 cy.server()、cy.route() 等命令模拟 API 请求。
- 可以使用 cy.screenshot()、cy.video() 等命令记录测试过程。
- Cypress 还提供了许多插件和扩展,可以进一步增强测试功能。
- 端到端测试是确保应用程序质量的重要一环,应该将其纳入持续集成和持续部署流程。
