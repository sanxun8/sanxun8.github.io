---
title: 响应式原理：dep（响应式对象的依赖管理器）
---

### 前言

在本章开始之前，需要有一个前置认知：Vue响应式的核心就是响应式对象和函数，对象改变，函数执行。在响应式中，dep起到是一个中间者的角色，看完本章，你将会明白**reactive**、**ref**响应式对象是如何通过**dep**通知函数的执行的。

dep实际上是一个map对象，键是effect对象，值为依赖标识。

```javascript
export const createDep = (cleanup, computed) => {
    const dep = new Map();
    dep.cleanup = cleanup;
    dep.computed = computed;
}
```

不同的响应式对象会创建用于存储**dep**的不同的数据结构，并使用**dep**进行通知函数执行，我们先来看一下**reactive**对象的dep结构创建以及函数调用通知过程。

### reactive

#### 依赖收集（对象构建）

让我看一下**reactive**创建用于存储**dep**的不同的数据结构的流程。


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

export function trackEffect(effect, dep, debuggerEventExtraInfo) {
    if (dep.get(effect) !== effect._trackId) { // effect._trackId 在ReactiveEffect.run时设置
        dep.set(effect, effect._trackId); // 设置副作用标识
        const oldDep = effect.deps[effect._depslength];
        if (oldDep !== dep) {
            if (oldDep) {
                cleanupDepEffect(oldDep, effect); // 清理dep下的副作用
            }
            effect.deps[effect._depslength++] = dep; // 标识副作用绑定到哪个dep
        } else {
            effect._depslength++; // 标识副作用绑定到多少dep下
        }
    }
}
```

上面函数有点绕，其实核心就是在生成一个数据结构，什么样的数据结构呢？我们来画个图看看：

![Imgur](https://i.imgur.com/X7hex8a.png)

我们创建了全局的**targetMap**，它的键是**target**，值是**depsMap**；这个**depsMap**的键是**target**的**key**，值是**dep**集合，**dep**集合中存储的是依赖的副作用函数**effect**。

#### 响应处理（函数执行）

看一下源码定义

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
```

述代码的核心流程就是获取需要响应的依赖，首先处理预留清理响应操作类型，所有依赖都需要被清理，其次修改属性为**length**且**target**为数组时，访问**length**属性的依赖以及数组中超过新数组长度的元素依赖需要被清理。获取需要响应的依赖后，暂停全局调度后，遍历执行**triggerEffects**，最后重置调度。

我们来看一下**triggerEffects**的实现

```javascript
export function triggerEffects(dep, dirtyLevels, debuggerEventExtraInfo) {
    pasuScheduling(); // 暂停全局调度
    // 遍历dep
    for (const effect of dep.keys()) {
        let tracking;
        if (
            effect._dirtyLevel < dirtyLevel &&
            (tracking ??= dep.get(effect) === effect._trackId)
        ) {
            effect._shouldSchedule ||= effect._dirtyLevel === dirtyLevels.NotDirty;
            effect._dirtyLevel = dirtyLevel;
        }

        if (
            effect._shouldSchedule &&
            (tracking ??= dep.get(effect === effect._trackId) === effect._trackId)
        ) {
            effect.trigger(); // 执行函数

            if (!effect._runnings || effect.allRecurse &&
                effect._dirtyLevel !== dirtyLevels.MaybeDirty_ComputedSideEffect
            ) { // 副作用不在运行中或者副作用允许递归且_dirtyLevel值不为2
                effect._shouldSchedule = false;

                if (effect.scheduler) {
                    queueEffectSchedulers.push(effect.scheduler);
                }
            }
        }
    }
    resetScheduling(); // 执行调度
}
```

上述代码的主要逻辑是，先暂停全局调度，然后遍历副作用对象，更新**_shouldSchedule**标识，然后根据**_shouldSchedule**判断是否执行调度函数，最后重新执行全局调度。

到这里我们就解析完**reactive**对象所创建用于存储**dep**的数据结构，以及**dep**进行通知函数执行的过程了。

### ref

#### 依赖收集（对象构建）

让我看一下**ref**创建用于存储**dep**的不同的数据结构流程。

```javascript
export function trackRefValue(ref) {
    if (shouldTrack && activeEffect) {
        ref = toRaw(ref);
        ref.dep ??= createDep(() => (ref.dep = undefined), ref instanceof ComputedRefImpl ? ref : undefined);
        trackEffect(activeEffect, ref.dep);
    }
}
```

可以发现，**ref**并没有创建额外的变量用于存储**dep**而是直接绑定到dep属性下面，然后复用**trackEffect**逻辑进行依赖收集。

#### 响应处理（函数执行）
看一下源码定义

```javascript
export function triggerRefValue(ref, dirtyLevel, newValue) {
    ref = toRaw(ref);
    const dep = ref.dep;
    if (dep) {
        triggerEffects(dep, dirtyLevel);
    }
}
```

可以发现，除了用于存储dep的数据结构不同外，**traEffect**以及**triggerEffects**都得到了很好的复用。