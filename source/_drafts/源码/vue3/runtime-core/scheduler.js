export const queuePostRenderEffect = queuePostFlushCb;

export function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (
      !activePostFlushCbs ||
      !activePostFlushCbs.includes(
        cb,
        cb.allowRecurse ? postFlushIndex + 1 : postFlushIndex
      )
    ) {
      pendingPostFlushCbs.push(cb);
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}

let isFlushing = false;
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvePromise.then(flushJobs);
  }
}

function flushJobs(seen) {
  isFlushPending = false;
  isFlushing = true;

  queue.sort(comparator);

  const check = Noop;

  // try {
  // for (flushIndex = 0; flushIndex)
  // }
}

const resolvePromise = Promise.resolve();
export function nextTick(fn) {
  const p = currentPromise || resolvePromise;
  return fn ? p.then(this ? fn.bind(this) : fn) : p;
}

const queue = [];
export function flushPreFlushCbs(
  instance,
  seen,
  i = isFlushing ? flushIndex + 1 : 0
) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.pre) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }

      queue.splice(i, 1);
      i--;
      cb();
    }
  }
}

const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
export function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;

    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }

    activePostFlushCbs = deduped;

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}

const getId = job => job.id == null ? Infinity : job.id;

export function nextTick(fn) {
  const p = currentPromise || resolvePromise;
  return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
