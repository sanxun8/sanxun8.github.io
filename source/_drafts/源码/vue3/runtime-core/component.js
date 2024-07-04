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