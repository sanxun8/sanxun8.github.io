---
title: vue3中ref模块源码解析
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
            triggerRefValue(this, DirtyLevels.Dirty, newVal); // 触发相应
        }
    }
}
```
至此，我们讲完了对ref响应式的依赖收集和触发过程, 但**trackValue**的收集依赖具体实现以及收集的依赖是如何管理的, **triggerRefValue**的触发视图更新具体实现并没有说清楚, 我们将在后续结合具体介绍

### 慧眼识珠
源码中往往包含了许多细微而重要的细节和技巧。通过学习源码，我们可以发现这些隐藏的细节，了解作者是如何处理边缘情况、优雅地解决问题以及实现功能的。这些细节和技巧对于开发者来说是宝贵的经验，能够帮助他们更好地编写可靠、高效的代码。以下是我所发现源码中的一些细节和感悟

**createRef**中提供了两个参数, 分别是**value**、**isShallow**以便ref、shallowRef使用同一套逻辑

```javascript
export function shallowRef(value) {
    return createRef(value, true);
}

```

### 其他内容

```javascript

function isRef(r) {
    return !!(r && r.__v_isRef === true);
}


export function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function toValue(source) {
    return isFunction(source) ? source() : unref(source);
}

const shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        } else {
            return Reflect.set(target, key, value, receiver);
        }
    },
}

export function proxyRefs(objectWithRefs) { // 不太理解依赖收集
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}


class CustomRefImpl {
    constructor(factory) {
        const { get, set } = factory(() => trackRefValue(this), () => triggerRefValue(this));
        this._get = get;
        this._set = set;
    }

    get value() {
        return this._get();
    }

    set value(newVal) {
        this._set(newVal);
    }
}


export function customRef(factory) {
    return new CustomRefImpl(factory);
}

export function toRefs(object) {
    if (__DEV__ && !isProxy(object)) {
        warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = propertyToRef(object, key)
    }
    return ret
}

class ObjectRefImpl {
    constructor(_object, _key, _defaultValue) {
        this._object = _object;
        this._key = _key;
        this._defaultValue = _defaultValue;
    }

    get value() {
        const val = this._object[this._key];
        return val === undefined ? this._defaultValue : val;
    }

    set value(newVal) {
        this._object[this._key] = newVal;
    }

    get dep() {
        return getDepFromReactive(toRaw(this._object), this._key)
    }
}

class GetterRefImpl {
    constructor(_getter) {
        this._getter = _getter;
        this.__v_isRef = true;
        this.__v_isReadonly = true;
    }
    get value() {
        return this._getter();
    }
}

export function toRef(source, key, defaultValue) {
    if (isRef(source)) {
        return source;
    } else if (isFunction(source)) { // 不太理解依赖收集
        return new GetterRefImpl(source);
    } else if (isObject(source) && arguments.length > 1) { // 不太理解依赖搜集
        return propertyToRef(source, key, defaultValue);
    } else {
        return ref(source);
    }
}

function propertyToRef(source, key, defaultValue) {
    const val = source[key];
    return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}
```