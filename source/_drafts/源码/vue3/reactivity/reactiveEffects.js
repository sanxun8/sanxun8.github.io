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