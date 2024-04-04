
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
        peddingPostFlushCbs.push(...cb);
    }
    queueFlush();
}

function queueFlush () {
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

    try {
        // for (flushIndex = 0; flushIndex)
    }
}