export const createDep = (cleanup, computed) => {
    const dep = new Map();
    dep.cleanup = cleanup;
    dep.computed = computed;
}