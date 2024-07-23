/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function (nums1, nums2) {
    function getKthElement(nums1, nums2, k) {
        let index1 = 0, index2 = 0;
        while (true) {
            // 边界情况
            if (index1 === nums1.length) {
                return nums2[index2 + k - 1];
            }
            if (index2 === nums2.length) {
                return nums1[index1 + k - 1];
            }
            if (k === 1) {
                return Math.min(nums1[index1], nums2[index2]);
            }

            // 正常情况
            const half = Math.floor(k / 2);
            const newIndex1 = Math.min(index1 + half, nums1.length) - 1;
            const newIndex2 = Math.min(index2 + half, nums2.length) - 1;
            const pivot1 = nums1[newIndex1];
            const pivot2 = nums2[newIndex2];
            if (pivot1 <= pivot2) {
                k -= (newIndex1 - index1 + 1);
                index1 = newIndex1 + 1;
            } else {
                k -= (newIndex2 - index2 + 1);
                index2 = newIndex2 + 1;
            }
        }
    }

    const totalLength = nums1.length + nums2.length;
    // 如果总长度是奇数，中位数是中间的数；如果是偶数，中位数是中间两个数的平均值
    const isEven = totalLength % 2 === 0;

    let left = 0, right = totalLength;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const num1 = getKthElement(nums1, nums2, mid);
        const num2 = getKthElement(nums1, nums2, mid + 1);
        if (isEven) {
            return (num1 + num2) / 2;
        } else {
            return num2;
        }
    }
};

const problem = findMedianSortedArrays
const args = [
    // [[1, 3], [2]],
    [[1, 2], [3, 4]],
]
for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    problem.apply(null, arg)
}