---
title: 响应式原理：依赖注入实现跨级组件数据共享
---

### provide

源码定义

```javascript

export function provide(key, value) {
  let provides = currentInstance.provides;

  const parentProvides = currentInstance.parent && currentInstance.parent.provides;
  if (parentProvide === provides) {
    provides = currentInstance.provides = Object.create(parentProvides);
  }
  provides[key] = value;
}
```

可以发现**instance**对象下含有**provides**属性，用于存储我们提供的数据，那么**provides**的初始化是怎么样的呢

```javascript
export function createComponentInstance(vnode, parent, suspense) {
  // ...
  const instance = {
    // ...
    parent,
    providees: parent ? parent.provides : Object.create(appContext.provides)
    // ...
  }

  // ...
}
```

可以发现**provides**利用原型链方式进行存储数据，默认情况下，实例继承其父级的提供对象，但是当它需要提供自己的值时，它会创建自己的值，自己提供的对象使用父级提供的对象作为原型。

### inject

源码定义

```javascript
export function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = currentInstance || currentRenderingInstance;

  if (instance || currentApp) {
    const provides = instance
      ? instance.parent == null
        ? instance.vnode.appContext && instance.vnode.appContext.provides
        : instance.parent.provides
      : currentApp._context.provides;

    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue)
        ? defaultValue.call(instance && instance.proxy)
        : defaultValue;
    } 
  }
}
```

上述代码主要逻辑就是需要**provides**对象，判断**key**是否是**provides**对象的枚举属性，若不是则使用提供的默认值。

