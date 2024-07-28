---
title: JavaScript 的基本数据类型
---

JavaScript 有以下基本数据类型:

- Number:
  - 表示数字,包括整数和浮点数。
  - 特殊数值包括 Infinity、-Infinity 和 NaN(Not a Number)。
- String:
  - 表示文本数据,可以使用单引号 '、双引号 "或反引号 ` 定义。
  - 支持内插表达式和模板字面量。
- Boolean:
  - 表示逻辑值,只有 true 和 false 两种取值。
- Null:
  - 表示一个明确的空值。
- Undefined:
  - 表示一个未定义的值,当声明一个变量但没有初始化时,它的值就是 undefined。
- Symbol:
  - ES6 引入的新数据类型,表示唯一且不可变的标识符。
  - 主要用于对象属性的唯一标识。
- BigInt:
  - ES2020 引入的新数据类型,用于表示任意精度的整数。
  - 解决了 Number 类型无法安全表示 2^53 以上整数的问题。

这些基本数据类型可以分为两类:

- 原始类型(Primitive Type):
  - Number、String、Boolean、Null、Undefined、Symbol、BigInt
- 引用类型(Reference Type):
  - Object(包括 Array、Function、Date、RegExp 等)

原始类型的值是不可变的,而引用类型的值是可变的。此外,JavaScript 还支持动态类型,意味着变量可以随时改变数据类型。

了解 JavaScript 的基本数据类型及其特点,对于正确理解和使用 JavaScript 非常重要。
