function reactive(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            console.log('get', key);
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            console.log('set', key, value);
            return Reflect.set(target, key, value, receiver);
        },
        ownKeys(target) {
            return Reflect.ownKeys(target);
        }
    });
}

const user = reactive({age: 18});

const items = reactive([]);
items.map(item => item);