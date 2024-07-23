function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
    let head = null, tail = null;
    let carry = 0;
    while (l1 || l2) {
        const n1 = l1 ? l1.val : 0;
        const n2 = l2 ? l2.val : 0;
        const sum = n1 + n2 + carry;
        if (!head) {
            head = tail = new ListNode(sum % 10);
        } else {
            tail.next = new ListNode(sum % 10);
            tail = tail.next;
        }
        carry = Math.floor(sum / 10);
        if (l1) {
            l1 = l1.next;
        }
        if (l2) {
            l2 = l2.next;
        }
    }
    if (carry > 0) {
        tail.next = new ListNode(carry);
    }
    return head;
};

function generateArg(arr) {
    let head, tail
    arr.forEach(element => {
        if (!head) {
            head = tail = new ListNode(element)
            return
        }

        tail.next = new ListNode(element)
        tail = tail.next
    });

    return head
}


const args = [
    [generateArg([2, 4, 3]), generateArg([5, 6, 4])],
    [generateArg([0]), generateArg([0])],
    [generateArg([9, 9, 9, 9, 9, 9, 9]), generateArg([9, 9, 9, 9])],
]
for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    addTwoNumbers.apply(arg, arg)
}



