---
title: 响应式原理：ReactiveEffect响应式副作用探秘
---

响应式对象中的执行函数、响应式触发器、调度器都是由**reactiveEffect**类进行管理的，学习本章，你将会明白**effect**、**computed**、**doWatch**、**setupRenderEffect**是如何通过**reativeEffect**控制执行函数、响应式触发器、调度器的执行时机的。

### ReactiveEffect

源码定义

```javascript
export class ReactiveEffect {
    constructor(fn, trigger, scheduler, scope) {
        this.fn = fn;
        this.trigger = trigger;
        this.scheduler = scheduler;

        this._runnings = 0; // 运行时状态 
        this._trackId = 0; // 依赖标识
        this._depsLength = 0; // 绑定该effect的deps长度
        this.deps = []; // 绑定该effect的deps
        recordEffectScope(this, scope); // 记录副作用范围
    }

    run() {
        this._dirtyLevel = DirtyLevels.NotDirty; // 设置脏值等级
        if (!this.active) {
            return this.fn(); // 若副作用函数不在响应式上下文中，则执行fn不收集依赖
        }

        let lastShouldTrack = shouldTrack; // 解决effect嵌套
        let lastEffect = activeEffect; // 解决effect嵌套
        try {
            shouldTrack = true;
            activeEffect = this; // 记录活动副作用实例
            this._runnings++;
            preCleanupEffect(this); // 属性初始化
            return this.fn(); // 运行回调函数（依赖收集，依赖清理）
        } finally {
            postCleanupEffect(this); // 依赖清理
            this._runnings--;
            activeEffect = lastEffect;
            shouldTrack = lastShouldTrack;
        }
    }
}
```

**run**接口的主要逻辑是处理先处理**fn**不在响应式上下文的情况，然后初始化**lastShouldTrack、lastEffect**解决effect嵌套问题，其次一些状态的初始化，包括**shouldTrack**、**activeEffect**、**_running**、**deps**、**_depsLength**。

初始化属性后执行**fn**触发依赖收集，

最后执行完依赖清理后，重置部分状态，重置状态包括**_running**、**activeEffect**、**shouldTrack**。

我们来看一下**preCleanupEffect**和**postCleanupEffect**的实现

```javascript
function preCleanupEffect(effect) {
    // 属性处理
    effect._trackId++;
    effect._depsLength = 0;
}

function postCleanupEffect(effect) {
    // 清楚依赖副作用
    if (effect.deps.length > effect._depsLength) {
        for (let i = effect._depsLength; i < effect.deps.length; i++) {
            cleanupDepEffect(effect.deps[i], effect);
        }
    }
}
```

可以看到**preCleanupEffect**只是做了一些属性的初始化，**postCleanupEffect**遍历绑定当前**effect**的dep，清理**dep**下的**effect**。

```javascript
function cleanupDepEffect(dep, effect) {
    const trackId = dep.get(effect); // 获取依赖标识
    if (trackId !== undefined && effect._trackId !== trackId) {
        dep.delete(effect); // 依赖删除
        if (dep.size === 0) {
            dep.cleanup(); // 执行回调
        }
    }
}
```

我们简单梳理一下**ReactiveEffect**实例接口调用逻辑，当我们调用**ReactiveEffect.run**会运行**fn**触发依赖收集，当响应式数据变化后会通知**ReactiveEffect.trgger**和**ReactiveEffect。shcedule**执行，具体依赖通知可以查看我的文章: [响应式原理：dep（响应式对象的依赖管理器）](https://sanxun8.github.io/2024/04/03/%E6%BA%90%E7%A0%81/vue3/dep/)。

我们知道当我们对一个响应式数据进行访问时，会触发响应式依赖收集，**ReactiveEffect.run**就是调用**ReactiveEffect.fn**达到依赖收集效果，但**ReactiveEffect.run**首次是在在哪里调用，以及后续响应式更新如何调用**ReactiveEffect.run**。带着这两个问题，我们来理解一下**effect**、**computed**、**doWatch**、**setupRenderEffect**对**ReactiveEffect**的使用情况。

### effect

有了以上知识，我们了解一下**effect**函数是如何调用**ReactiveEffect.run**触发依赖收集，当依赖变化后又做了哪些事情

```javascript
export function effect(fn, options) {
    // 如果 fn 已经是一个 effect 函数了，则指向原始函数
    if (fn.effect instanceof ReactiveEffect) {
        fn = fn.effect.fn;
    }

    // 初始化响应式副作用实例
    const _effect = new ReactiveEffect(fn, NOOP, () => {
        if (_effect.dirty) {
            _effect.run();
        }
    })

    // 选项逻辑处理
    if (options) {
        extend(_effect, options); // 合并对象
        if (options.scope) recordEffectScope(_effect, options.scope); // 记录副作用范围
    }

    /// 副作用运行
    if (!options || !options.lazy) {
        _effect.run();
    }

    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner; // 返回运行器
}
```

**effect**首先处理**fn**为副作用函数时，指向回原函数，然后构建一个**ReactiveEffect**实例，通过传入一个**schedule**函数达到从新执行**fn**效果。然后就是**options**逻辑的处理。当我们不传options时，默认执行**ReactiveEffect.run**达到依赖收集效果，函数返回**ReactiveEffect.run**函数，可以根据业务自由调用。

### ComputedRefImpl

有些同学可能不了解**ComputedRefImpl**是个什么，**ComputedRefIml**实际时**computed**对象的构造器的，我们接着来了解一个**ComputedRefImpl**是如何调用**ReactiveEffect.run**触发依赖收集的。

```javascript

export function computed(getterOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;

    const onlyGetter = isFunction(getterOptions);

    if (onlyGetter) {
        getter = getterOptions;
    } else {
        getter = getterOptions.get;
        setter = getterOptions.set;
    }

    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);

    return cRef;
}

export class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, isSSR) {
        // 实例化副作用
        this.effect = new ReactiveEffect(
            () => getter(this._value),
            () => triggerRefValue(
                this,
                this.effect._dirtyLevel === DirtyLevels.MaybeDirty_ComputedSideEffect
                    ? DirtyLevels.MaybeDirty_ComputedSideEffect
                    : DirtyLevels.MaybeDirty,
            )
        );
    }

    get value() {
        const self = toRaw(this);
        self._value = self.effect.run();

        return self._value;
    }
}
```

可以发现，当我们**ComputedRefImpl.value getter**访问时，会触发**ReactiveEffect.run**从而调用**computed.value getter**触发依赖收集

### doWatch

如果你还不了解**doWatch**是个什么，你可以查看一下我的文章：[响应式原理：Watch 函数的实现](https://sanxun8.github.io/2024/04/03/%E6%BA%90%E7%A0%81/vue3/watch/)


```javascript
export function doWatch(source, cb, { immediate, deep, flush, once, onTrack, onTrigger } = EMPTY_OBJ) {
    // ...

    const job = () => {
        effect.run();
    }

    const effect = new ReactiveEffect(getter, NOOP, scheduler);

    effect.run()
}
```

这里对**doWatch**的实现代码进行大量缩减。从上述代码以及前面对**ReactiveEffect**认识，我们可以发现，**doWatch**实际上定义了个**getter**函数对响应式依赖进行收集。这里不对**scheduler**定义进行展开，你可以简单理解为scheduler实际就是执行**job**函数，从而达到执行**getter**效果，而**ReactiveEffect.run**的首次调用是在**doWatch**内部执行的。

### setupRenderEffect

setupRenderEffect是组件更新的核心

```javascript

function baseCreateRenderer(options, createHydrationFns) {
  const setupRenderEffect = (
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    namspace,
    optimized,
  ) => {
    const effect = new ReactiveEffect(componentUpdateFn, NOOP, () => queueJob(update), instance.scope);

    const update = () => {
        if (effect.dirty) {
            effect.run();
        }
    }
    update();
  }
}
```

我们知道组件编译后会编译成**render**函数，这里我们可以理解**componentUpdateFn**实际就是调用组件**render**达到响应式数据依赖收集的效果，而传输的**scheduler**调度器就简单理解成对**update**函数的调用，而**ReactiveEffect.run**的首次调用也是在**setupRenderEffect**调用的。