---
title: 响应式原理：ref对象解析
---

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
            triggerRefValue(this, DirtyLevels.Dirty, newVal); // 触发响应
        }
    }
}
```

可以发现，**RefImpl**定义了**value gettter**用于依赖的收集，定义了**value setter**用于触发响应。如果你想了解**trackRefValue**、**triggerRefValue**做了些什么，可以查看我的文章[响应式原理：dep（响应式对象的依赖管理器）](https://sanxun8.github.io/2024/04/03/%E6%BA%90%E7%A0%81/vue3/dep/)

