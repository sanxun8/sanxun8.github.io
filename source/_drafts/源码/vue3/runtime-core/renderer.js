export function createRenderer(options) {
  return baseCreateRenderer(options);
}

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

  const processText = (n1, n2, container, anchor) => {};

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
  ) => {};

  const mountElement = (
    vnode,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    slotScopeIds,
    optimized
  ) => {};

  const mountChildren = (
    children,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    slotScopeIds,
    optimized,
    start = 0
  ) => {};

  const patchElement = (
    n1,
    n2,
    parentComponent,
    parentSuspense,
    namespace,
    slotScopeIds,
    optimized
  ) => {};

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

  const mountComponent = (
    initialVNode,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    optimized
  ) => {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    ));

    if (isKeepAlive(initialVNode)) {
      // 为 keepAlive 注入渲染器内部结构
      instance.ctx.renderer = internals;
    }

    setupComponent(instance);

    setupRenderEffect(
      instance,
      initialVNode,
      container,
      anchor,
      parentSuspense,
      namespace,
      optimized
    );
  };

  const updateComponent = (n1, n2, optimized) => {};

  const patchChildren = (
    n1,
    n2,
    container,
    anchor,
    parentComponent,
    parentSuspense,
    namespace,
    slotScopeIds,
    optimized = false
  ) => {};

  const move = (
    vnode,
    container,
    anchor,
    moveType,
    parentSuspense = null
  ) => {};

  const unmount = (
    vnode,
    parentComponent,
    parentSuspense,
    doRemove = false,
    optimized = false
  ) => {};

  const remove = (vnode) => {};

  const unmountComponent = (instance, parentSuspense, doRemove) => {};

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

    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs();
      flushPostFlushCbs();
      isFlushing = false;
    }
    container._vnode = vnode;
  };

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
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);

        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }

        if (
          !isAsyncWrapperVNode &&
          (vnodeHook = props && props.onVnodeBeforeMount)
        ) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);

        const subTree = (instance.subTree = renderComponentRoot(instance));
        patch(
          null,
          subTree,
          container,
          anchor,
          instance,
          parentSuspense,
          namespace
        );
        initialVNode.el = subTree.el;

        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (
          !isAsyncWrapperVNode &&
          (vnodeHook = props && props.onVnodeMounted)
        ) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }

        if (
          initialVNode.shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE ||
          (parent &&
            isAsyncWrapper(parent.vnode) &&
            parent.vnode.shapeFlag & ShapeFlags.COMPoNENT_SHOULD_KEEP_ALIVE)
        ) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;

        initialVnode = container = anchor = null;
      } else {
        // ...
      }
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

  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate),
  };
}
