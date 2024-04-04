export let activeEffect;

export let shouldTrack = true;

export let pauseScheduleStack = 0;

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

    stop() {
        if (this.active) {
            preCleanupEffect(); // 属性初始化
            postCleanupEffect(); // 清理后逻辑
            this.onStop?.(); // 执行onStop
            this.active = false;
        }
    }
}

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

function cleanupDepEffect(dep, effect) {
    const trackId = dep.get(effect); // 获取依赖标识
    if (trackId !== undefined && effect._trackId !== trackId) {
        dep.delete(effect); // 依赖删除
        if (dep.size === 0) {
            dep.cleanup(); // 执行回调
        }
    }
}

export function stop(runner) {
    runner.effect.stop();
}

export function pauseTracking() {
    // 依赖栈处理
    trackStack.push(shouldTrack);
    // 收集状态处理
    shouldTrack = false;
}

export function enableTracking() {
    // 依赖栈处理
    trackStack.push(shouldTrack);
    // 收集状态处理
    shouldTrack = true;
}

// 重置上一个全局副作用依赖状态
export function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
}

export function pauseScheduling() {
    pauseScheduleStack++;
}

export function resetScheduling() {
    pauseScheduleStack--;
    while (!pauseScheduleStack && queueEffectSchedulers.length) {
        queueEffectScheduler.shift()();
    }
}

export function triggerEffects(dep, dirtyLevel, debuggerEventExtraInfo) {
    pauseScheduling(); // 暂停调度

    // 遍历依赖
    for (const effect of dep.keys()) {
        let tracking;
        if (
            effect._dirtyLevel < dirtyLevel &&
            (tracking ??= dep.get(effect) === effect._trackId)
        ) {
            effect._shouldSchedule = effect._shouldSchedule || effect._dirtyLevel === DirtyLevels.NotDirty;
            effect._dirtyLevel = dirtyLevel;
        }
        if (
            effect._shouldSchedule &&
            (tracking ??= dep.get(effect) === effect._trackId)
        ) {
            effect.trigger(); // 副作用触发
        }
        if (
            (!effect._runnings || effect.allowRecurse) &&
            effect._dirtyLevel !== DirtyLevels.MaybeDirty_ComputedSideEffect
        ) {
            effect._shouldSchedule = false;
            if (effect.scheduler) {
                queueEffectScheduler.push(effect.shceduler);
            }
        }
    }

    // 重置调度
    resetScheduling();
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