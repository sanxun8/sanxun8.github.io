---
title: 渲染器：组件是如何被渲染成DOM的？
---

我们知道，**Vue3**是通过**createApp**创建一个项目实例的，本章将已**createApp**为起点，解析组件的渲染过程。

### createApp

```javascript
export const createApp = (...args) => {
  const app = ensureRenderer().createApp(...args);

  const { mount } = app;
  app.mount = (containerSelector) => {
    const container = normalizeContainer(containerSelector);
    if (!container) return;

    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innnerHTML;
    }

    container.innnerHTML = '';
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute('v-cloak');
      container.setAttribute('data-v-app', '');
    }

    return proxy;
  }
 
  return app;
}
```


可以发现该函数主要逻辑是执行**ensureRenderer**以及**ensureRenderer**返回的**createApp**函数。

然后对**app.mount**添加而外操作，包括对**container**进行参数归一化，初始化**component.template**、**container.innnerHTML**。我们看一下**normalizeContainer**的实现

```javascript
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }

  return container;
}。
```

最后就是构建**mount**所需参数并调用，我们看一下**resolveRootNamespace**实现

```javascript
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }

  if (
    typeof MathMLElement === "function" &&
    container instanceof MathMLElement
  ) {
    return "mathml";
  }
}
```

默认情况下我们传入的**container**是个div元素，所以运行该函数返回值为**undifined**

### ensureRenderer

回过头来，我们看一下**ensureRenderer**的实现

```javascript
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRender(renderOptions));
}

export function createRenderer(options) {
  return baseCreateRenderer(options);
} 

function baseCreateRenderer(options, createHydrationFns) {
  // ...

  const processComponent = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    slotScopeIds,
    optimized
  ) => {
    // ...
  }

  const processElement = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    slotScopeIds,
    sptimized
  ) => {
    // ...
  }

  const render = (vnode, container, namespace) => {
   // ... 
  }

  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate),
  }
}
```

该函数返回一个**renderer**, 默认情况下**renderer**是未定义的，执行**createRender**实际是执行**baseCreateRenderer**。我们这里现有一个概念，Dom的渲染都是由**baseCreateRenderer**方法内部进行定义，如**processComponent**组件流程管理, **processElement**元素流程管理, **render**虚拟节点渲染等等。

### createAppAPI

当我们执行**ensureRenderer().createApp(...args)**实际是执行**createAppAPI**的返回函数，我们看一下**createAppAPI**实现

```javascript
let uid = 0
export function createAppAPI(render, hydrate) {
  return function createApp(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extent({}, rootComponent);
    }

    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }

    const context = createAppContext();
    const installedPlugins = new WeakSet();

    let isMounted = false;

    const app = context.app = {
      _uid: uid ++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,

      version,

      get config() {
        return context.config;
      },

      set config(v) {
        // 报警
      },

      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) {
          // 报警
        } else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        }

        return app;
      },
      
      mixin(mixin) {
        // 兼容vue2
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        } 
        context.components[name] = component;

        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directive[name];
        }
        context.directive[name] = directive;

        return app;
      },

      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = createVNode(rootComponent, rootProps);
          vnode.appContext = context;

          if (namespace === true) {
            namespace = 'svg';
          } else if (namespace === false) {
            namespace = undefined;
          }

          if (isHydrate && hydrate) {
            hydrate(vnode, rootContainer);
          } else {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app = app;

          return getExposeProxy(vnode.component) || vnode.component.proxy;
        }
      }
    }

  };
}
```

可以发现上述代码主要逻辑就是对参数进行一些处理，然后对**app**实例属性和方法进行初始化设置，我们看一下**createAppContext**实现

### createAppContext

```javascript
export function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionsMergeStrategies: {},
      errorHandler: undefined,
      warnHandler: undefined,
      compilerOptions: {},
    },
    mixins: [],
    components: {},
    directive: {},
    provides: Object.create(null),
    optionsCache: new WeakMap(),
    propsCache: new WeakMap(),
    emitsCache: new WeakMap(),
  };
}
```

这里只需要对**appContext**对象有一个初步印象。

然后我们着重看一下**app.mount**，当我们调用该方法后，我们会调用**createVNode**创建虚拟节点对象，其内部实际是调用**createBaseVNode**进行创建的，我们简单看一下虚拟节点对象的属性

### createBaseVNode

```javascript
function createBaseVNode(
  type,
  props,
  children,
  patchFlag,
  dynamicProps,
  shapeFlag = type === Fragment ? 0 : ShapeFlags.ELEMENT,
  isBlockNode = false,
  needFuluuChildrenNormalization = false
) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  }

  // ...

  return vnode;
}
```

得到虚拟节点对象后，给该对象绑定**appContext**属性存储app实例上下文信息, 此时我们传输的**isHydrate = false, namespace = undefined**， 会执行**render**方法，我们看一下其实现

```javascript
function baseCreateRenderer(options, createHydrationFns) {
  const render = (vnode, container, namespace) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }

    container._vnode = vnode;
  }
}
```

此时我们的**vnode**有值，执行**patch**

### patch

```javascript
function baseCreateRenderer(options, createHydrationFns) {
   const patch = (
    n1,
    n2,
    container,
    anchor = null,
    parentComponent = null,
    parentSuspense = null,
    namespace = undefined,
    slotScopeIds = null,
    optimized = !!n2.dynamicChildren
  ) => {
    if (n1 === n2) {
      return;
    }

    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }

    if (n2.patchFlag === PatchFlags.BAIL) {
      optimized = false;
      n2.dynamicChildren = null;
    }

    const { type, ref, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & ShapeELEMENT) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & shapeFlag.COMPONENT) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        }
    }
  };
}
```

可以发现**patch**函数实际就是一个中转站，根据不同的**type**和**shapeFlag**执行不同的流程，此时我们执行的是**processComponent**流程

### processComponent

```javascript
function baseCreateRenderer(options, createHydrationFns) {
  const processComponent = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    slotScopeIds,
    optimized
  ) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        parentComponent.ctx.active(
          n2,
          container,
          anchor,
          namespace,
          optimized1
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
}
```

可以发现**processComponent**也是一个流程的控制，此时**n1 = null**的，执行**mountComponent**

### mountComponent

```javascript
function baseCreateRenderer(options, createHydrationFns) {
  const mountComponent = (
    initialVNode,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    optimized
  ) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );

    if (isKeepAlive(initialVNode)) { // 为 keepAlive 注入渲染器内部结构
      instance.ctx.renderer = internals
    }

    setupComponent(instance);

    setupRenderEffect(
      instance,
      initialVNode,
      container,
      anchor,
      parentSuspense,
      namespace,
      optimized,
    );
  };
}
```

可以发现组件挂载的核心就在与执行**createComponentInstance**、**setupComponent**、**setupRenderEffect**这三个函数。我们先来看一下**createComponentInstance**

### createAppContext

```javascript
let uid = 0;
const emptyAppContext = createAppContext()

export function createComponentInstance(
  vnode,
  parent,
  suspense
) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;

  const instance = {
    uid: uid++,
    vnode,
    parent,
    appContext,
    root: null,
    next: null,
    subTree: null,
    effect: null,
    update: null,
    scope: new EffectScope(true),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    accessCache: null,
    renderCache: [],

    components: null,
    directives: null,

    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),

    emit: null,
    emitted: null,

    propsDefault: EMPTY_OBJ,

    inheritAttrs: type.inheritAttrs,

    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,

    attrsProxy: null,
    slotsProxy: null,

    suspense,
    suspenseId: suspense ? suspense.pedingId : 0,
    asyncDep: null,
    asyncResolved: false,

    // 生命周期钩子
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null, // 创建前
    c: null, // 创建
    bm: null, // 挂载前
    m: null, // 挂载
    bu: null, // 更新前
    u: null, // 更新
    um: null, // 卸载 
    bum: null, // 卸载前
    da: null, // 若组件实例是 <KeepAlive> 缓存树的一部分，组件从 DOM 中被移除时
    a: null, // 若组件实例是 <KeepAlive> 缓存树的一部分，当组件被插入到 DOM 中时调用
    rtg: null, // 当响应式依赖的变更触发了组件渲染时调用。
    rtc: null, // 当组件渲染过程中追踪到响应式依赖时调用。
    ec: null, // 在捕获了后代组件传递的错误时调用。
    sp: null, // 在组件实例在服务器上被渲染之前调用。
  }

  // ...

  return instance
}
```

再看看**setupComponent**实现

```javascript
export function setupComponent(
  instance,
  isSSR = false
) {
  isSSR && setInSSRSetupState(isSSR);

  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children);

  const setupResult = isStateful
    ? setupStatefulComponent(instance, isSSR)
    : undefined;

    isSSR && setInSSRSetupState(false);
  
  return setupResult;
}
```

可以发现该函数组要进行组件的初始化工作。

再看一下**setupRenderEffect**的实现

```javascript
function baseCreateRenderer(options, createHydrationFns) {
  const setupRenderEffect = (
    instance,
    initialVNode,
    container,
    anchor,
    parentSuspense,
    namspace,
    optimized
  ) => {
    const componentUpdateFn = () => {
      // ...
    };

    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      NOOP,
      () => queueJob(update),
      instance.scope
    ));

    const update = (instance.update = () => {
      if (effect.dirty) {
        effect.run();
      }
    });
    update.id = instance.uid;
    toggleRecurse(instance, true);

    update();
  };
}
```

