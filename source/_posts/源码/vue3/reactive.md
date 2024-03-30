---
title: vue3中reactive模块源码解析
---

### Reactive
源码中关于**Reactive**部分的定义：
```javascript
export function reactive(target) {
    if(isReadonly(target)) {
        return target;
    }

    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
```
这个函数核心也就是通过**createReactiveObject**把我们传入的**target**变成响应式的

```javascript
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if(!isObject(target)) {
        return target;
    }

    if(target[ReactiveFlags.RAW] && !(isReadonly && target[ReactiveFlags.IS_REACTIVE])) {
        return target;
    }

    const existingProxy = proxyMap.get(target);
    if(existingProxy) {
        return existingProxy;
    }

    const targetType = getTargetType(target);
    if(targetType === TargetType.INVALID) {
        return target;
    }

    const proxy = new Proxy(target, targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);

    return proxy;
}
```
上述代码核心流程就是首先经过一系列判断，判断符合要求的**target**才能被响应式。包括target的类型、是否是响应式、是否已经背定义过了、是否是符合要求的类型。最后执行**new Proxy**对target进行代理, 其核心是处理器, 我们将在后续整理一期**handlers**的文章

至此，我们讲完了对reactive响应式的实例化过程

### 慧眼识珠
源码中往往包含了许多细微而重要的细节和技巧。通过学习源码，我们可以发现这些隐藏的细节，了解作者是如何处理边缘情况、优雅地解决问题以及实现功能的。这些细节和技巧对于开发者来说是宝贵的经验，能够帮助他们更好地编写可靠、高效的代码。以下是我所发现源码中的一些细节和感悟

将reactive数据分类四种类型, 
```javascript
export const reactiveMap = new WeakMap();
export const shallowReactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();
export const shallowReadonlyMap = new WeakMap();

export function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}

export function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}

export function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReactiveHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
```

### 其他内容
```javascript
export function isReactive(value) {
    if(isReadonly(value)) {
        return isReactive(value[ReactiveFlags.RAW]);
    }

    return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export function isReadonly(value) {
    return !!(value && value[ReactiveFlags.IS_READONLY]);
}

export function isShallow(value) {
    return !!(value && value[ReactiveFlags.IS_SHALLOW]);
}

export function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

export function toRaw(observed) {
    const raw = observed && observed[ReactiveFlags.RAW];

    return raw ? toRaw(raw) : observed;
}

export function markRaw(value) {
    if(Object.isExtensible(value)) {
        def(value, ReactiveFlags.SKIP, true);
    }

    return value;
}

export function toReactive(value) {
    isObject(value) ? reactive(value) : value;
}

export function toReadonly(value) {
    isObject(value) ? readonly(value) : value;
}

```