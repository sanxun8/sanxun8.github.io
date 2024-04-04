---
title: vue3中computed模块源码解析
---

### Computed

源码中关于**computed**部分的定义：

```javascript
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
```

上述代理核心流程就是先进行参数归一化, 然后生成并返回一个实例化对象。让我们一起看一下啊**ComputedRefImpl**的实现

```javascript
export class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, isSSR) {
        this.getter = getter;
        this._setter = _setter;

        // 实例化副作用 暂不清楚_dirtyLevel属性更新逻辑
        this.effect = new ReactiveEffect(
            () => getter(this._value),
            () => triggerRefValue(
                this,
                this.effect._dirtyLevel === DirtyLevels.MaybeDirty_ComputedSideEffect
                    ? DirtyLevels.MaybeDirty_ComputedSideEffect
                    : DirtyLevels.MaybeDirty,
            )
        );
        
        this.effect.computed = this; // 一个标记，会优先于其他普通副作用函数先执行
        this.effect.active = this._cacheable = !isSSR; // 暂不知道active用途
        this[ReactiveFlags.IS_READONLY] = isReadonly;
    }

    get value() {
        const self = toRaw(this);

        // 脏值则进行更新
        if(
            (!self._cacheable || self.effect.dirty) &&
            hasChanged(self._value, (self._value) = self.effect.run())
        ) {
            triggerRefValue(self, DirtyLevels.Dirty);
        }

        // 依赖收集
        trackRefValue(self);

        if(self.effect._dirtyLevel >= DirtyLevels.MaybeDirty_ComputedSideEffect) {
            triggerRefValue(self, DirtyLevels.MaybeDirty_ComputedSideEffect);
        }

        return self._value;
    }
    // 执行setter
    set value(newValue) {
        this._setter(newValue);
    }
}
```

简单看一下该类的实现，在构造函数的时候，创建一个副作用对像**effect**。并为**effect**额外定义了一个**computed**属性执行当前响应式对象**cRef**对象。

另外，定义了一个**ComputedRefImpl.value getter**方法，当我们通过**cRef.value**取值的时候，会判断是否有脏值，脏值处理核心就是调用**trggerRefValue**，如果你想了解**trackRefValue**、**trggerRefValue做了些什么，可以查看我的文章[响应式原理：dep（响应式对象的依赖管理器）]

其还定义了一个**ComputedRefImpl.value setter**方法，该方法就是执行过程传入进来得**computed.value setter**函数。

有了上面得介绍，我们来看一个具体的例子，看看**computed**是如何执行的：

```html
<script src="../../dist/vue.global.js"></script>

<div id="demo">
  <div>
    {{ sum.value }}
  </div>
  <button @click="add">add</button>
</div>

<script>
  Vue.createApp({
    setup() {
      const a = Vue.ref(1);

      const sum = Vue.computed(getter);
      function getter() {
        return a.value + 1
      }

      function add() {
        a.value = 2;
      }

      return { sum }
    },
  }).mount('#demo')
</script>
```

1. **computed**函数执行，初始化过程中，生成了一个**computed effect**.
2. 上述的template会被编译为**render**函数，**render**执行，访问了**sum.value**，触发了收集，此时收集的副作用为**render effect**, 会执行**ComputedRefImpl.value getter**，此时的**self._dirty = true**执行**effect.run()**也就是执行了**computed.value getter**函数，得到**_value = 1**
3. **computed.value getter**函数体内访问了**a.value**触发了对**a**的依赖收集，此时收集到的依赖为**computed effect**。
4. 按钮点击后，执行**add**更新了**a.value**值触发了**computed effect**的**trigger**，也就是执行**render**。
5. 执行**render**会访问**ComputedRefImpl.value getter**, 会执行**computed effect.run()**触发**computed.value getter**函数的执行。因为此时的**_dirty = true**, 所以**get value**会重新计算**_value**的值为**sum.value = 3**。
6. **sum.value**的值变化后，触发了**triggerRefvalue**, 即**render**会重新执行。


