```javascript
function ref(value) {
    return createRef(value, false);
}

function createRef(rawValue, shallow) {
    if(isRef(rawValue)) {
        return rawValue
    }

    return new RefImpl(rawValue, shallow);
}

class RefImpl {
    constructor(value, __v_isShallow) {
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : toReactive(value);
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }

    set value(newValue) {
        const useDirectValue = this.__v_isShallow || isShallow(newValue) || isReadonly(newValue);
        newValue = useDirectValue ? newValue : toRaw(newValue);

        if(hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue;
            this._value = useDirectValue ? newValue : toReactive(newValue);
            triggerRefValue(this, DirtyLevels.Dirty, newValue);
        }
    }
}
```