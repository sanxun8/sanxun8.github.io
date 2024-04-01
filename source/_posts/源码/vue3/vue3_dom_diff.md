---
title: 渲染器：数组节点中的Dom diff
---

在前端开发中，我们经常需要处理包含数组子节点的动态列表或复杂组件。本文将基于源码，梳理数组子节点的Diff更新流程，帮助读者更好地理解Vue3是如何通过Diff算法来高效地更新这些子节点，以提升应用性能。

### 从头对比

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    // (a b) c
    // (a b) d e
    while (i < e1 && i < e2) {
        const n1 = c1[i];
        const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (isSameVNodeType(n1, n2)) {
            patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)
        } else {
            break;
        }
        i++;
    }
}
```

### 从尾部对比

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    // ...

    // 2. 尾对比
    // a (b c)
    // d e (b c)
    while (i < e1 && i < e2) {
        const n1 = c1[e1];
        const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
        if (isSameVNodeType(n1, n2)) {
            patch(n1, n2, container, null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)
        } else {
            break;
        }
        e1--;
        e2--;
    }
}
```

### 仅处理新增

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    //  ...
    // 2. 从尾部对比
    // ...

    // 3. 仅新增
    // (a b)
    // (a b) c
    // i = 2, e1 = 1, e2 = 2
    // (a b)
    // c (a b)
    // i = 0, e1 = -1, e2 = 0
    if (i > e1) {
        if (i <= e2) {
            const nextPos = e2 + 1;
            const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;

            while (i <= e2) {
                patch(null, c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]), container, anchor, parentComponent, parentSuspense)
                i++;
            }
        }
    } 
}
```

### 仅处理卸载

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    //  ...
    // 2. 从尾部对比
    // ...
    // 3. 仅新增
    if(i > e1) { // ...} 

    // 4. 仅卸载
    // (a b) c
    // (a b)
    // i = 2, e1 = 2, e2 = 1
    // a (b c)
    // (b c)
    // i = 0, e1 = 0, e2 = -1
    else if (i > e2) {
        while (i <= e1) {
            unmount(c1[i], parentComponent, parentAnchor, true);
            i++;
        }
    }
}
```

### 处理未知序列

#### 构建新节点key到index的映射

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    //  ...
    // 2. 从尾部对比
    // ...
    // 3. 仅新增
    if(i > e1) { // ...} 
    // 4. 仅卸载
    else if (i > e2) { // ... }

    else {
        const s1 = i; // 旧节点开始处理索引
        const s2 = i; // 新节点开始处理索引

        // 5.1 构建新节点key到index的映射
        const keyToNewIndexMap = new Map();
        for (i = s2; i <= e2; i++) {
            const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);

            if (nextChild.key != null) {
                keyToNewIndexMap.set(nextChild.key, i);
            }
        }
    }
}
```

#### 5.2 处理旧节点（更新和卸载）

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    //  ...
    // 2. 从尾部对比
    // ...
    // 3. 仅新增
    if(i > e1) { // ...} 
    // 4. 仅卸载
    else if (i > e2) { // ... }

    else {
        const s1 = i; // 旧节点开始处理索引
        const s2 = i; // 新节点开始处理索引

        // 5.1 构建新节点key到index的映射
        // ...

        // 5.2 处理旧节点（更新和卸载）
        let patched = 0; // 已处理的数目
        const toBePatched = e2 - s2 + 1; // 需要处理的数目
        let moved = false; // 标记节点是否移动
        let maxNewIndexSoFar = 0; // 辅助判断节点是否移动
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

        for (i = s1; i <= e1; i++) {
            const prevChild = e1[i];

            if (patched >= toBePatched) { // 卸载多余节点
                unmount(prevChild, parentComponent, parentSuspense, true);
                continue;
            }

            let nextIndex;
            newIndex = keyToNewIndexMap.get(prevChild.key);
            if (newIndex === undefined) { // 新节点找不到则卸载
                unmount(prevChild, parentComponent, parentAnchor, true);
            } else {
                newIndexToOldIndexMap[newIndex - s2] = i + 1;
                if (newIndex >= maxNewIndexSoFar) {
                    maxNewIndexSoFar = newIndex;
                } else {
                    moved = true;
                }
                patch(prevChild, c2[newIndex], null, parentComponent, parentSuspense, namespace, slotScopeIds, optimized)
                patched++;
            }
        } 
    }
}
```

#### 5.3 移动和新增

```javascript
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0; // 当前对比索引
    const l2 = c2.length; // 新节点长度
    let e1 = c1.length - 1; // 旧节点结束标识
    let e2 = l2 - 1; // 新节点介绍标识

    // 1. 头对比
    //  ...
    // 2. 从尾部对比
    // ...
    // 3. 仅新增
    if(i > e1) { // ...} 
    // 4. 仅卸载
    else if (i > e2) { // ... }

    else {
        const s1 = i; // 旧节点开始处理索引
        const s2 = i; // 新节点开始处理索引

        // 5.1 构建新节点key到index的映射
        // ...
        // 5.2 处理旧节点（更新和卸载）
        // ...

        // 5.3 移动和新增
        const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
        let j = increasingNewIndexSequence.length - 1;

        for (i = toBePatched - 1; i >= 0; i--) {
            const nextIndex = s2 + i;
            const nextChild = c2[nextIndex];
            const anchor = nextIndex + 1 < l2 ? c2[nextIndex].el : parentAnchor;

            if (newIndexToOldIndexMap[i] === 0) {
                patch(null, nextChild, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized);
            } else if (moved) {
                if (j < 0 || i !== increasingNewIndexSequence[j]) {
                    moved(nextChild, container, anchor, MoveType.REORDER);
                } else {
                    j--;
                }
            }
        }
}
```

#### 优化思考

- 唯一标识: 我们使用 v-for 编写列表时为什么不建议使用 index 作为 key?



### 总结

希望本文能够帮助读者深入理解基于数组子节点的Diff更新流程，并在实际项目中应用这一知识，提升应用的性能和用户体验