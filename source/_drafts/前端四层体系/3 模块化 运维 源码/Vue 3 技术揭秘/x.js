function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    // 排除等于 0 的情况
    if (arrI !== 0) {
      j = result[result.length - 1];
      // 与最后一项进行比较
      if (arr[j] < arrI) {
        // 存储在 result 更新前的最后一个索引的值
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      // 二分搜索，查找比 arrI 小的节点，更新 result 的值
      while (u < v) {
        // 取整得到当前位置
        c = ((u + v) / 2) | 0;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          // 正确的结果
          p[i] = result[u - 1];
        }
        // 有可能替换会导致结果不正确，需要一个新数组 p 记录正确的结果
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];

  // 回溯数组 p，找到最终的索引
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

getSequence([1, 4, 5, 2, 8, 7, 6, 0]);
