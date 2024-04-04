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

    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }

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
                oldValue = newValue
            }
        } else {
            effect.run();
        }
    }

    job.allowRecurse = !!cb;

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

    const effect = new ReactiveEffect(getter, NOOP, scheduler);

    const scope = getCurrentScope();
    const unwatch = () => {
        effect.stop();
        if (scope) {
            remove(scope.effects, effect);
        }
    }

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

export function traverse(value, depth, currentDepth = 0, seen) {
    if (!isObject(value) || value[ReactiveFlags.SKIP]) {
        return value;
    }

    if (depth && depth > 0) {
        if (currentDepth >= depth) {
            return value;
        }
        currentDepth++;
    }

    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
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