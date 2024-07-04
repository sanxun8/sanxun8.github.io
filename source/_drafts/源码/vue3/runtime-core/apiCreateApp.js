let uid = 0;
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

    const app = (context.app = {
      _uid: uid++,
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
            namespace = "svg";
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
      },
    });
  };
}

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
