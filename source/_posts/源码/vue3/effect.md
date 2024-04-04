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



### effect

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

**effect**通过传入一个调度器执行fn

### ComputedRefImpl

```javascript
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

**ComputedRefImpl.value getter**执行**effect.run**后，执行**computed.value getter**触发响应式依赖收集，响应式变量更新后执行**computed effect**响应

### doWatch
```javascript
const effect = new ReactiveEffect(getter, NOOP, scheduler)
```

### setupRenderEffect
```javascript
const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      NOOP,
      () => queueJob(update),
      instance.scope, // track it in component's effect scope
    ))
```