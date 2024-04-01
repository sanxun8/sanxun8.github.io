
export function ref(value) {
    return createRef(value, false);
}

function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }

    return new RefImpl(rawValue, shallow);
}

class RefImpl {
    constructor(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : toReactive(value);
    }

    get value() {
        trackRefValue(this); // 收集依赖
        return this._value;
    }

    set value(newVal) {
        const useDirectValue = this.__v_isShallow || isShallow(newVal) || isReadonly(newVal);
        newVal = useDirectValue ? newVal : toRaw(newVal);
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = useDirectValue ? newVal : toReactive(newVal);
            triggerRefValue(this, DirtyLevels.Dirty, newVal); // 触发相应
        }
    }
}

function isRef(r) {
    return !!(r && r.__v_isRef === true);
}


export function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function toValue(source) {
    return isFunction(source) ? source() : unref(source);
}

const shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        } else {
            return Reflect.set(target, key, value, receiver);
        }
    },
}

export function proxyRefs(objectWithRefs) { // 不太理解依赖收集
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}


class CustomRefImpl {
    constructor(factory) {
        const { get, set } = factory(() => trackRefValue(this), () => triggerRefValue(this));
        this._get = get;
        this._set = set;
    }

    get value() {
        return this._get();
    }

    set value(newVal) {
        this._set(newVal);
    }
}


export function customRef(factory) {
    return new CustomRefImpl(factory);
}

export function toRefs(object) {
    if (__DEV__ && !isProxy(object)) {
        warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = propertyToRef(object, key)
    }
    return ret
}

class ObjectRefImpl {
    constructor(_object, _key, _defaultValue) {
        this._object = _object;
        this._key = _key;
        this._defaultValue = _defaultValue;
    }

    get value() {
        const val = this._object[this._key];
        return val === undefined ? this._defaultValue : val;
    }

    set value(newVal) {
        this._object[this._key] = newVal;
    }

    get dep() {
        return getDepFromReactive(toRaw(this._object), this._key)
    }
}

class GetterRefImpl {
    constructor(_getter) {
        this._getter = _getter;
        this.__v_isRef = true;
        this.__v_isReadonly = true;
    }
    get value() {
        return this._getter();
    }
}

export function toRef(source, key, defaultValue) {
    if (isRef(source)) {
        return source;
    } else if (isFunction(source)) { // 不太理解依赖收集
        return new GetterRefImpl(source);
    } else if (isObject(source) && arguments.length > 1) { // 不太理解依赖搜集
        return propertyToRef(source, key, defaultValue);
    } else {
        return ref(source);
    }
}

function propertyToRef(source, key, defaultValue) {
    const val = source[key];
    return isRef(val) ? val : new ObjectRefImpl(source, key, defaultValue);
}

export function shallowRef(value) {
    return createRef(value, true);
}