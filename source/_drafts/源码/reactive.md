```javascript
function reactive(target) {
    if(isReadonly(target)) {
        return target;
    }

    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}

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