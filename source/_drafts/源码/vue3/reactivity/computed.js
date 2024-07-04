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
        this.getter = getter;
        this._setter = _setter;

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

        this.effect.computed = this;
        this.effect.active = this._cacheable = !isSSR;
        this[ReactiveFlags.IS_READONLY] = isReadonly;
    }

    get value() {
        const self = toRaw(this);

        // 脏值则进行更新
        if (
            (!self._cacheable || self.effect.dirty) &&
            hasChanged(self._value, (self._value) = self.effect.run())
        ) {
            triggerRefValue(self, DirtyLevels.Dirty);
        }

        // 依赖收集
        trackRefValue(self);

        if (self.effect._dirtyLevel >= DirtyLevels.MaybeDirty_ComputedSideEffect) {
            triggerRefValue(self, DirtyLevels.MaybeDirty_ComputedSideEffect);
        }

        return self._value;
    }
    // 执行setter
    set value(newValue) {
        this._setter(newValue);
    }
}