---
title: 响应式原理：watch函数的实现
---

### 参数归一化

我知道**watch**的**source**参数接受类型有**ref**, **computed**, **reactive**, **gertter**或者组合成数组类型

```javascript
export function watch(source, cb, options) {
    return dowatch(source, cb, options);
}

export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    const warnInvalidSource = (s) => {
        // 一些警告
    }

    const instance = currentInstance;
    const reactiveGetter = source =>
        deep === true ? source : traverse(source, deep === false ? 1 : undefined);

    let getter;
    let forceTrigger = false;
    let isMultiSource = false;

    // 参数归一化
    if (isRef(source)) {
        getter = () => source.value;
        forceTrigger = isShallow(source);
    } else if (isReactive(source)) {
        getter = () => reactiveGetter(source);
        forceTrigger = true;
    } else if (isArray(source)) {
        isMultiSource = true;
        forceTrigger = source.some(s => isReactive(s) || isShallow(s));
        getter = () => source.map(s => {
            if (isRef(s)) {
                return s.value;
            } else if (isReactive(s)) {
                return reactiveGetter(s);
            } else if (isFunction(s)) {
                return callWithErrorHandling(s, instance, ErrorCodes.WATCH_GETTER);
            } else {
                warnInvalidSource(s);
            }
        });
    } else if (isFunction(source)) {
        if (cb) {
            getter = () => callWithErrorHandling(source, instance, ErrorCodes.WATCH_GETTER);
        } else {
            getter = () => {
                if (cleanup) {
                    cleanup();
                }
                return callWithAsyncErrorHandling(
                    source,
                    instance,
                    ErrorCodes.WATCH_GETTER,
                    [onCleanup]
                );
            }
        }
    } else {
        getter = Noop;
        warnInvalidSource(s);
    }

    // ...
}
```

可以发现**watch**实际通过**doWatch**实现的，**doWatch**第一步就是**watch**的参数**source**进行归一化处理。以达到我们访问**getter**会触发响应式数据的依赖收集的目的。

### 深层响应式处理

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }

    // ...
}

export function traverse(value, depth, currentDepth = 0, seen) {
    if (!isObject(value) || value[ReactiveFlags.SKIP]) { // 跳出递归方式
        return value;
    }

    if (depth && depth > 0) {
        if (currentDepth >= depth) {
            return value;
        }
        currentDepth++;
    }

    seen = seen || new Set();
    if (seen.has(value)) { // 重复值则跳出
        return value;
    }
    seen.add(value);

    // 对各种类型进行属性访问，达到依赖收集效果
    if (isRef(value)) {
        traverse(value.value, depth, currentDepth, seen);
    } else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], depth, currentDepth, seen);
        }
    } else if (isSet(value) || isMap(value)) {
        value.forEach(v => {
            traverse(v, depth, currentDepth, seen);
        })
    } else if (isPlainObject(value)) {
        for (const key in value) {
            traverse(value[key], depth, currentDepth, seen);
        }
    }

    return value;
}
```

可以发现深层响应式处理核心在**traverse**函数，该函数为递归函数，当**value**不为对象时，直接返回**value**。 提供了**depth**对监听层级进行管理，不传则为深层监听。提供**seen**处理重复值跳出。最后时对不同类型对象属性进行访问，达到依赖收集的效果。

### 提供清理钩子

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
    // 提供清理钩子
    let cleanup;
    let onCleanup = fn => {
        cleanup = effect.onStop = () => {
            callWithErrorHandling(fn, instance, ErrorCodes.WATCH_CLEANUP);
            cleanup = effect.onStop = undefined;
        }
    }

    let ssrCleanup;
    if (__SSR__ && isInSSRComponentSetup) {
        onCleanup = Noop;
        if (!cb) {
            getter();
        } else if (immediate) {
            callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
                getter(),
                isMultiSource ? [] : undefined,
                onCleanup
            ]);
        }

        if (flush === 'sync') {
            const ctx = useSSRContext();
            ssrCleanup = ctx.__watchHandles || (ctx.__watchHandles = []);
        } else {
            return NOOP;
        }
    }
    // ...
}
```

**onCleanup**将会成为**cb**的第三个实参，我们可以根据业务需要执行**onCleanup**。

### 定义工作函数

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
    let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
    const job = () => { // 定义工作函数
        if (!effect.active || !effect.dirty) { // 不在响应式上下文或无脏值
            return;
        }

        if (cb) {
            const newValue = effect.run();
            if (
                deep ||
                forceTrigger ||
                (isMultiSource
                    ? newValue.some((v, i) => hasChanged(v, oldValue[i]))
                    : hasChanged(newValue, oldValue)
                )
            ) {
                if (cleanup) {
                    cleanup();
                }
                callWithAsyncErrorHandling(cb, instance, ErrorCodes.WATCH_CALLBACK, [
                    newValue,
                    oldValue === INITIAL_WATCHER_VALUE
                        ? undefined
                        : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE
                            ? []
                            : oldValue,
                    onCleanup
                ]);
            }
        } else {
            effect.run();
        }
    }

    job.allowRecurse = !!cb;

    // ...
}
```

可以发现**job**函数主要逻辑是先判断**watch**函数执行上下文，以及是否有脏值，然后执行**effect.run**，即执行归一化化后的**getter**函数达到依赖收集效果。若接受了**cb**函数，根据是否存在脏值执行**cb**,b并更新**oldValue**值。

### 定义调度器

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
    let scheduler; // 定义调度器
    if (flush === 'sync') {
        scheduler = job;
    } else if (flush === 'post') {
        scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
    } else {
        job.pre = true;
        if (instance) job.id = instance.id;
        scheduler = () => queueJob(job);
    }
    // ...
}
```

### 构建ReactiveEffect

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
    const effect = new ReactiveEffect(getter, NOOP, scheduler);
    // ...
}
```

可以发现前面定义的**getter**, **job**其实都是服务于构建**ReactiveEffect**实例的。

### 定义监听卸载

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
    const scope = getCurrentScope();
    const unwatch = () => {
        effect.stop(); // 清楚依赖
        if (scope) {
            remove(scope.effects, effect);
        }
    }
    // ...
}
```

### 首次执行

```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...
if (cb) {
        if (immediate) {
            job();
        } else {
            oldValue = effect.run();
        }
    } else if (flush === 'post') {
        queuePostRenderEffect(
            effect.run.bind(effect),
            instance && instance.suspense
        );
    } else {
        effect.run();
    }

    if (__SSR__ && ssrCleanup) ssrCleanup.push(unwatch);

    return unwatch;
}
```

