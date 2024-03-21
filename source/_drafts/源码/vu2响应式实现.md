```javascript
function defineReacitve(obj, key, value, customSetter) {
    let childOb = observe(val);

    Object.defineProperty(obj, key, {
        enumeralbe: true,
        configurable: true,
        get: function () {
            // 收集
        },
        set: function () {
            // 通知
        },
    })
}
```