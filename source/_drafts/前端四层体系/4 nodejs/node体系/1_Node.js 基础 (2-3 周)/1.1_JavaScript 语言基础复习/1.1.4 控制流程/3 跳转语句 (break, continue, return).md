---
title: 跳转语句 (break, continue, return)
---

在 JavaScript 中,有三种常用的跳转语句:

## break 语句:

- break 语句用于立即终止当前循环(for、while、do-while)或 switch 语句的执行。
- 当 break 语句执行时,程序会跳出当前循环或 switch 语句,继续执行后续的代码。
- 示例:

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    break; // 当 i 等于 5 时,终止循环
  }
  console.log(i); // 输出 0 1 2 3 4
}
```

## continue 语句:

- continue 语句用于跳过当前循环迭代,进入下一个循环迭代。
- 当 continue 语句执行时,程序会跳过当前循环体中剩余的语句,直接进入下一次循环。
- 示例:

```javascript
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    continue; // 当 i 为偶数时,跳过当前循环迭代
  }
  console.log(i); // 输出 1 3 5 7 9
}
```

## return 语句:

- return 语句用于从函数中返回一个值,并终止函数的执行。
- 当 return 语句执行时,程序会立即退出当前函数,并返回指定的值。
- 示例:

```javascript
function calculateSum(a, b) {
  const sum = a + b;
  return sum; // 返回 a 和 b 的和,并退出函数
}

const result = calculateSum(3, 4); // result 的值为 7
```

这三种跳转语句都可以帮助我们控制程序的执行流程,根据不同的需求选择合适的跳转语句非常重要。在编写代码时,务必谨慎使用这些语句,以免造成意外的结果。
