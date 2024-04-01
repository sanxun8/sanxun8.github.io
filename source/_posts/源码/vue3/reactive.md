---
title: 响应式原理：reactive对象的响应式解析
---

### 前言

由于vue中的响应式都是基于**ReactiveEffect**实现的的，**effect**为其使用之一。本小节基于**effect**理解**ref**对象的响应过程。若你想了解**effect**，你可以查看我往期的文章。

```javascript
const user = reactive({
    name: 'jack'
});
effect(() => {
    console.log(user.name)
});

setTimeout(() => {
    user.name = 'tom';
}, 1000)
```

### Reactive

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

再回过来看**get api**，接下来的操作就是通过**track(target, TrackOpTypes.Get, key)**进行依赖收集，我们再来一起看一下**track**的实现：

```javascript
let shouldTrack = true;
let activeEffect; // ReactiveEffect实例

const targetMap = new WeakMap();
export function track(target, type, key) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetMap.get(target);

        // 初始化依赖映射
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }

        let dep = depsMap.get(key);
        // 设置依赖
        if (!dep) {
            depsMap.set(key, (dep = createDep(() => depsMap.delete(key))));
        }

        // 收集副作用
        trackEffect(activeEffect, dep);
    }
}

export function trackEffect(effect, dep, debuggerEventEXtraInfo) {
    // 待完善
    // 设置依赖标识

    // 清除依赖副作用

    // 调用收集回调

    if (dep.get(effect) !== effect._trackId) {
        dep.set(effect, effect._trackId);
    }
} 
```

上面函数有点绕，其实核心就是在生成一个数据结构，什么样的数据结构呢？我们来画个图看看：

![Imgur](https://i.imgur.com/X7hex8a.png)

我们创建了全局的**targetMap**，它的键是**target**，值是**depsMap**；这个**depsMap**的键是**target**的**key**，值是**dep**集合，**dep**集合中存储的是依赖的副作用函数**effect**。

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

接下来核心就是**trigger**的逻辑，是如何实现触发响应的：


```javascript
export function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);

    // 处理未收集
    if (!depsMap) {
        return
    }

    let deps = []; // 需要被处理依赖
    if (type === TriggerOpTypes.CLEAR) { // 操作为清理 
        deps = [...depsMap.values()];
    } else if (key === 'length' && isArray(target)) {
        const newLength = Number(newValue);
        depsMap.forEach((dep, key) => {
            if (key === 'length' || (!isSymbol(key) && key >= newLength)) {
                deps.push(dep);
            }
        });
    } else {
        if (key !== void 0) {
            deps.push(depsMap.get(key));
        }

        switch (type) {
            case TriggerOpTypes.ADD:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERACE_KEY)); // 暂不理解
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY)); // 暂不理解
                    }
                } else if (isIntegerKey(key)) {
                    deps.push(depsMap.get('length')); // // 暂不理解
                }

                break;
            case TriggerOpTypes.DELETE:
                if ((!isArray(target))) {
                    deps.push(depsMap.get(ITERACE_KEY)); // 暂不理解
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY)); // 暂不理解
                    }
                }

                break;
            case TriggerOptypes.SET:
                if (isMap(target)) {
                    deps.push(depsMap.get(ITERACE_KEY)); // 暂不理解
                }
        }
    }

    // 暂停调度
    pauseScheduling();

    // 遍历依赖，执行副作用
    for (const dep of deps) {
        if (dep) {
            triggerEffects(dep, DirtyLevels.Dirty)
        }
    }

    // 重置调调
    resetScheduling();
}

export function trackEffect(effect, dep, debuggerEventEXtraInfo) {
    // 待完善
    
    // 设置依赖标识

    // 清除依赖副作用

    // 调用收集回调

    if (dep.get(effect) !== effect._trackId) {
        dep.set(effect, effect._trackId);
    }
} 
```

上述代码的核心流程就是获取需要响应的依赖，首先是响应操作类型为清理时，所有依赖都需要被清理，其次修改**length**属性且**target**为数组时，访问**length**属性的依赖以及数组中超过新数组长度的元素依赖需要被清理。获取需要响应的依赖后，暂停全局调度后，遍历执行其副作用函数，最后重置调度。


### 总结

至此，我们讲完了对**reactive**对象响应式的依赖收集和触发过程。