export function provide(key, value) {
  let provides = currentInstance.provides;

  const parentProvides = currentInstance.parent && currentInstance.parent.provides;
  if (parentProvide === provides) { // 初始化
    provides = currentInstance.provides = Object.create(parentProvides);
  }
  provides[key] = value;
}

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