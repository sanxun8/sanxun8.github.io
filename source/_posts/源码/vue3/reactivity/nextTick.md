---
title: 响应式原理：nextTick函数解析
---

```javascript
const resolvePromise = Promise.resolve();
export function nextTick(fn) {
    const p = currentPromise || resolvePromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
```

可以发现，当**currentPromise**不存在时，默认将**fn**放到微任务队列里面。
