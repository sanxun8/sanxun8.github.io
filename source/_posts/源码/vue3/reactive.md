---
title: 响应式原理：reactive对象解析
---

### reactive

源码中关于**Reactive**部分的定义：

```javascript
export function reactive(target) {
    if(isReadonly(target)) {
        return target;
    }

    return createReactiveObject(
        target, 
        false, 
        mutableHandlers, 
        mutableCollectionHandlers, 
        reactiveMap
    );
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

    const proxy = new Proxy(
        target, 
        targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
    );
    proxyMap.set(target, proxy);

    return proxy;
}
```

上述代码核心流程就是首先经过一系列判断，判断符合要求的**target**才能被响应式。包括target的类型、是否是响应式、是否已经被定义过了、是否是符合要求的类型。最后执行**new Proxy**对target进行代理, 其核心是处理器。我们先来看一下是定义了几种处理器，以及如何确认处理器的类型的

```javascript
function targetType(rawType) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION;
        default:
            return TargetType.INVALID;
    }
}

function getTargetType(value) {
    return value[ReactiveFlags.SKIP] || !Object.isExtensible(value) ? TargetType.INVALID : targetType(toRawType(value));
}
export const toRawType = (value) => {
  // toTypeString 转换成字符串的方式，比如 "[object RawType]"
  return toTypeString(value).slice(8, -1)
}
```

因为**target**传入进来的是一个**Object**，所以**toRawType**得到的值是**Object**。所以这里的值等于**TargetType.Common**也就是使用**baseHandlers**。若传入进来的是**Map**、**Set**、**WeakMap**、**WeakSet**类型，则使用**collectionHandlers**，本章不进行展开**collectionHandlers**的解析。

接下来看一下**baseHandlers**的实现：
```javascript
export const mutableHandlers = {
    get,
    set,
    deleteProperty,
    has,
    ownKeys,
}
```

这里就是**Proxy**中的定义**handler**的一些属性

- get：属性读取操作的捕捉器。
- set：属性设置操作的捕捉器。
- deleteProperty： delete操作符的捕捉器。
- has：in操作符的捕捉器。
- ownKeys：Object.getOwnPropertyNames方法和Object.getOwnPropertySymbols方法的捕捉器。

**reactive**对象响应式的核心就在**set**和**get**中，我们一起来看一下二者的实现

#### get

get的源码实现
```javascript
class BaseReactiveHandler {
    constructor(_isReadonly = false, _isShallow = false) {
        this._isReadonly = isReadonly;
        this._isShallow = _isShallow;
    }

    get(target, key, receiver) {
        const isReadonly = this._isReadonly;
        const isShallow = this._isShallow;

        // 对 ReactiveFlags 的处理部分
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        } else if (key === ReactiveFlags.IS_SHALLOW) {
            return isShallow;
        } else if (key === ReactiveFlags.RAW) {
            if (
                receiver ===
                (isReadonly
                    ? isShallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : isShallow
                        ? shallowReactiveMap
                        : reactiveMap
                ).get(target) ||
                Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)
            ) {
                return target;
            }

            return;
        }

        const targetIsArray = isArray(target);

        if (!isReadonly) {
            // 过滤数组变异方法
            if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
                return Reflect.get(Instrumentations, key, receiver);
            }

            if (key === 'hasOwnProperty') {
                return hasOwnProperty;
            }
        }

        const res = Reflect.get(target, key, receiver);

        // 过滤 Symbol Key 和 一些不收集依赖的键
        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res;
        }

        if (!isReadonly) {
            track(target, TrackOpTypes.Get, key);
        }

        if (isShallow) {
            return res;
        }

        if (isRef(res)) { // 不太清楚
            return targetIsArray && isIntegerKey(key) ? res : res.value;
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }

        return res;
    }
}
```
**get api**核心流程就是首先经过一系列判断, 判断符合要求的**key**才进行依赖收集, 然后根据对不同的类型进行处理返回。不收集依赖的key包括预设属性、symbol类型的自有属性。

当我们的**target**是数组，且**key**值存在**arraInstrumentations**中时，返回**arraInstrumentations**中对应的**key**值。我们再来看看**arraInstrumentations**是个什么：

```javascript
const arrayInstrumentations = createArrayInstrumentations()

function createArrayInstrumentations() {
    const instrumentations = {};
    (['includes', 'indexOf', 'lastIndexOf']).forEach(key => {
        instrumentations[key] = function (this, ...args) {
            // toRaw 可以把响应式对象转成原始数据
            const arr = toRaw(this)

            for (let i = 0, l = this.length; i < l; i++) {
                // 对数组的每一项进行依赖收集
                track(arr, TrackOpTypes.GET, i + '')
            }
            // 先尝试用参数本身，可能是响应式数据
            const res = arr[key](...args)
            if (res === -1 || res === false) {
                // 如果失败，再尝试把参数转成原始数据
                return arr[key](...args.map(toRaw))
            } else {
                return res
            }
        }
    });

    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
        instrumentations[key] = function (this, ...args) {
            pauseTracking()
            const res = toRaw(this)[key].apply(this, args)
            resetTracking()
            return res
        }
    })
    return instrumentations
}
```

**arrayInstrumentations**会重写两类函数，一类是查询类函数：**inclues**、**indexOf**、**lastIndeOf**，代表对数组的读取操作。在这些函数中会执行**track**函数，对数组的索引进行依赖收集。

另一类是修改类函数：**push**、**pop**、**shift**、**unshift**、**splice**，代表对数组的修改操作，在这些函数中暂停了全局的追踪功能，防止某些情况下导致死循环。

如果你想了解**track**做了些什么，可以查看我的文章[响应式原理：dep（响应式对象的依赖管理器）]

#### set

上面说完了**get**的流程，我们了解一下依赖收集后的数据结构存储在了**targetMap**中，接下来我们接着看**set**的过程：

```javascript
class MutableReactiveHandler extends BaseReactiveHandler {
    constructor(isShallow = false) {
        super(false, isShallow);
    }

    set(target, key, value, receiver) {
        let oldValue = target[key];

        // 对深层响应式，处理新旧值
        if (!this._isShallow) {
            const isOldValueReadonly = isReadonly(oldValue);

            if (!isShallow(value) && !isReadonly(value)) {
                oldValue = toRaw(oldValue);
                value = toRaw(value);
            }

            if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                if (isOldValueReadonly) {
                    return false;
                } else {
                    oldValue.value = value;
                    return true;
                }
            }
        }

        // 判断是否为已有属性
        const hadKey = 
            isArray(target) && isIntegerKey(key) 
                ? (Number(key) < target.length) 
                : hasOwn(target, key); 
        const result = Reflect.set(target, key, value, receiver);
        if (target === toRaw(receiver)) {

            // 触发响应
            if (!hadKey) {
                trigger(target, TriggerOpTypes.ADD, key, value);
            } else if (hasChanged(value, oldValue)) {
                trigger(target, TriggerOpTypes.SET, key, value, oldValue);
            }
        }

        return result;
    }
}

```

可以看到**set**接口核心逻辑就是根据是否为渐层响应式来确认原始值和新值，这里默认不是浅层的响应式，所以会先把原始值和新值进行**toRaw**转换，然后通过**Reflect.set**设置值，最后通过**trigger**函数派发通知，并依据**key**是否存在于**target**来确认通知类型是**add**（新增）还是**set**（修改）。

如果你想了解**trigger**做了些什么，可以查看我的文章[响应式原理：dep（响应式对象的依赖管理器）]