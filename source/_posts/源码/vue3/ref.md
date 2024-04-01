---
title: 响应式原理：ref对象的响应式解析
---

### 前言

由于vue中的响应式都是基于**ReactiveEffect**实现的的，**effect**为其使用之一。本小节基于**effect**理解**ref**对象的响应过程。若你想了解**effect**，你可以查看我往期的文章。

```javascript
const isLike = ref(true);
effect(() => {
    console.log(isLike.value)
});

setTimeout(() => {
    isLike.value = false;
}, 1000)
```

**effect**默认会调用回调函数，当访问了**isLike.value**, 会执行**trackRefValue**收集依赖，当给**isLike.value**重新赋值后，会执行**triggerRefValue**触发响应。而**trackRefValue、triggerRefValue**在源码中是如何调用的、做了哪些事情，跟着我的步伐，你将会得到答案。

### Ref

源码中关于**ref**部分的定义：

```javascript
export function ref(value) {
    return createRef(value, false);
}
```

这个函数的核心也就是通过**createRef**把我们传入的**value**变成响应式的

```javascript
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }

    return new RefImpl(rawValue, shallow);
}
```

先经过判断，判断符合要求的**value**才能被响应式。一起来看看这个**API**的实现：

```javascript
class RefImpl {
    constructor(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : toReactive(value);
    }

    get value() {
        trackRefValue(this); // 收集依赖
        return this._value;
    }

    set value(newVal) {
        const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
        newVal = useDirectValue ? newVal : toRaw(newVal);
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = useDirectValue ? newVal : toReactive(newVal);
            triggerRefValue(this, DirtyLevels.Dirty, newVal); // 触发相应
        }
    }
}
```

当调用**value getter**时，会调用**trackRefValue**收集依赖，让我们看一下**trackRefValue**的实现

```javascript
export function trackRefValue(ref) {
    if (shouldTrack && activeEffect) {
        ref = toRaw(ref);
        ref.dep ??= createDep(() => (ref.dep = undefined), ref instanceof ComputedRefImpl ? ref : undefined);
        trackEffect(activeEffect, ref.dep);
    }
}
```

trackRefValue会给ref增加依赖dep属性存储副作用函数

```javascript
export const createDep = (cleanup, computed) => {
    const dep = new Map();
    dep.cleanup = cleanup;
    dep.computed = computed;
    return dep;
}

export function trackEffect(effect, dep, debuggerEventExtraInfo) {
    // 待完善
    // 设置依赖标识
}
```

当调用**value setter**时，会调用**triggerRefValue**触发更新，让我们看一下**triggerRefValue**的实现

```javascript
export function triggerRefValue(ref, dirtyLevel, newValue) {
    ref = toRaw(ref);
    const dep = ref.dep;
    if (dep) {
        triggerEffects(dep, dirtyLevel);
    }
}
```

其核心就是调用用**triggerEffects**触发副作用函数执行

```javascript
export function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
    // 待完善
    // 暂停调度
    // 遍历依赖，执行副作用函数
    // 重置调度
}
```

### 总结

至此，我们讲完了对**ref**对象响应式的依赖收集和触发过程。
