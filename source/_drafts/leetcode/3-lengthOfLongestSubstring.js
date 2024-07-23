/**
   * @param {string} s
   * @return {number}
   */
var lengthOfLongestSubstring = function (s) {
    const set = new Set()
    let result = 0, rk = -1, length = s.length
    for (let i = 0; i < s.length; i++) {
        if (i) {
            set.delete(s[i - 1])
        }

        while (rk + 1 < length && !set.has(s[rk + 1])) {
            set.add(s[rk + 1])
            rk++
        }
        result = Math.max(result, rk - i + 1)

    }

    return result
};

const problem = lengthOfLongestSubstring
const args = [
    ['aa'],
    ['abcabcbb'],
    ['bbbbb'],
    ['pwwkew']
]
for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    problem.apply(null, arg)
}