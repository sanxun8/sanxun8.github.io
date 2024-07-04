export function reactive(target) {
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