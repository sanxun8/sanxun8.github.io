/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
    var map = new Map()
    for (var i = 0; i < nums.length; i++) {
        var num = nums[i]
        var diff = target - num
        if (map.has(diff)) {
            return [i, map.get(diff)]
        }

        map.set(num, i)
    }

    return []
};
