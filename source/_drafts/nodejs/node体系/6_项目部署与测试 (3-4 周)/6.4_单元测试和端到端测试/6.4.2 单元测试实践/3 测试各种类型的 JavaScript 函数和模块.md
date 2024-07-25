---
title: 测试各种类型的 JavaScript 函数和模块
---

在 JavaScript 中,我们可以使用单元测试框架来测试各种类型的函数和模块。以下是一些示例:


## 测试基本函数:

```javascript
// add.js
function add(a, b) {
  return a + b;
}

module.exports = add;

// add.test.js
const add = require('./add');

test('adds 2 and 3 to equal 5', () => {
  expect(add(2, 3)).toBe(5);
});
```

## 测试带有条件分支的函数:

```javascript
// getGrade.js
function getGrade(score) {
  if (score >= 90) {
    return 'A';
  } else if (score >= 80) {
    return 'B';
  } else if (score >= 70) {
    return 'C';
  } else {
    return 'F';
  }
}

module.exports = getGrade;

// getGrade.test.js
const getGrade = require('./getGrade');

test('should return correct grade', () => {
  expect(getGrade(95)).toBe('A');
  expect(getGrade(85)).toBe('B');
  expect(getGrade(75)).toBe('C');
  expect(getGrade(65)).toBe('F');
});
```

## 测试异步函数:

```javascript
// fetchData.js
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Data fetched successfully');
    }, 2000);
  });
}

module.exports = fetchData;

// fetchData.test.js
const fetchData = require('./fetchData');

test('should fetch data successfully', async () => {
  const data = await fetchData();
  expect(data).toBe('Data fetched successfully');
});
```

## 测试 ES6 模块:

```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// math.test.js
import { add, multiply } from './math';

test('add function works correctly', () => {
  expect(add(2, 3)).toBe(5);
});

test('multiply function works correctly', () => {
  expect(multiply(2, 3)).toBe(6);
});
```

## 测试 React 组件:

```javascript
// Counter.js
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

export default Counter;

// Counter.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('Counter component works correctly', () => {
  const { getByText } = render(<Counter />);
  const countText = getByText('Count: 0');
  expect(countText).toBeInTheDocument();

  const incrementButton = getByText('Increment');
  fireEvent.click(incrementButton);
  expect(getByText('Count: 1')).toBeInTheDocument();
});
```

这些示例展示了如何使用 Jest 或 Mocha 等测试框架来测试不同类型的 JavaScript 函数和模块,包括基本函数、带有条件分支的函数、异步函数、ES6 模块以及 React 组件。通过编写这些测试用例,可以确保代码的正确性、健壮性和可维护性。
