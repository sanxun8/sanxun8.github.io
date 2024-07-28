---
title: 条件语句 (if-else, switch)
---

在 JavaScript 中,我们可以使用条件语句来控制程序的执行流程。主要有以下两种条件语句:

## if-else 语句:

```javascript
if (type) {
  // 如果条件为 true,执行这里的代码
} else {
  // 如果条件为 false,执行这里的代码
}
```

- if 语句后跟一个条件表达式,如果表达式的结果为 truthy,则执行 if 块中的代码。
- else 语句用于在条件表达式为 falsy 时执行相应的代码。
- 可以使用 else if 添加更多的条件分支。

## switch 语句:

```javascript
switch (type) {
  case `type1`:
    // 如果表达式的值等于值 1,执行这里的代码
    break;
  case "type2":
    // 如果表达式的值等于值 2,执行这里的代码
    break;
  default:
  // 如果以上所有 case 都不匹配,执行这里的代码
}
```

- switch 语句用于根据一个表达式的值,执行不同的代码块。
- case 子句用于检查表达式的值是否匹配,如果匹配则执行相应的代码块。
- break 语句用于退出 switch 语句,防止执行后续的 case 子句。
- default 子句用于在所有 case 都不匹配时执行相应的代码。

这两种条件语句都可以帮助我们根据不同的条件执行不同的代码,从而实现更复杂的程序逻辑。在实际编程中,根据具体需求选择合适的条件语句非常重要。
