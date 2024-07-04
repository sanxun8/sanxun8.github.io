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

    container.innnerHTML = "";
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }

    return proxy;
  };

  return app;
};

function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }

  return container;
}

let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRender(renderOptions));
}

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
