class BaseReactiveHandler {
    constructor(_isReadonly = false, _isShallow = false) {
        this._isReadonly = isReadonly;
        this._isShallow = _isShallow;
    }

    get(target, key, receiver) {
        const isReadonly = this._isReadonly;
        const isShallow = this._isShallow;

        // 过滤预设属性
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

        // 过滤Symbol自有属性 和 一些不收集依赖的键
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
        } else {

        }

        // 判断是否为已有属性
        const hadKey = isArray(target) && isIntegerKey(key) ? (Number(key) < target.length) : hasOwn(target, key); 
        const result = Reflect.set(target, key, value, receiver);
        if (target === toRaw(receiver)) {

            // 触发更新
            if (!hadKey) {
                trigger(target, TriggerOpTypes.ADD, key, value);
            } else if (hasChanged(value, oldValue)) {
                trigger(target, TriggerOpTypes.SET, key, value, oldValue);
            }
        }

        return result;
    }

    deleteProperty(target, key) {
        // 判断是否为已有属性
        const hadKey = hasOwn(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);

        // 若为已有属性，则更新
        if (result && hadKey) {
            trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue);
        }

        return result;
    }

    has(target, key) {
        const result = Reflect.has(target, kay);

        // 判断key是否为symbol类型或非Symbol自有属性
        if (!isSymbol(key) || !builtInSymbols.has(key)) {
            // 若key为symbol类型或非Symbol自有属性, 则触发更新
            track(target, TrackOpTypes, HAS, key);
        }

        return result;
    }

    ownKeys(target) {
        // 触发更新
        track(target, TrackOpTypes.ITERATE, isArray(target) ? 'length' : ITERATE_KEY);

        return Reflect.ownKeys(target);
    }
}

class ReaonlyReactiveHandler extends BaseReactiveHandler {
    set(target, key) {
        return true;
    }

    deleteProperty(target, key) {
        return true
    }
}