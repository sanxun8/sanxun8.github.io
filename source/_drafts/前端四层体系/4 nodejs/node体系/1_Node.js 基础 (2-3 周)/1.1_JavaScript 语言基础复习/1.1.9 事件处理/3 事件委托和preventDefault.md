---
title: 事件委托和preventDefault
---

事件委托和 preventDefault 是 JavaScript 事件处理中的两个重要概念。

## 事件委托:

事件委托是一种事件处理的模式,它利用事件的冒泡机制,将事件处理程序附加到父元素上,而不是每个子元素上。这样可以大大减少需要注册的事件处理程序的数量,提高性能。

```javascript
// 事件委托示例
const list = document.getElementById("myList");

list.addEventListener("click", function (event) {
  if (event.target.tagName === "LI") {
    console.log("Clicked on list item:", event.target.textContent);
  }
});
```

在上面的例子中,我们将事件处理程序附加到了 #myList 元素上,而不是每个 `<li>` 元素上。当用户点击列表项时,事件会冒泡到父元素 #myList，我们在这里进行处理。

## preventDefault:

有时候,我们需要阻止浏览器的默认行为,例如阻止表单的提交,或者阻止链接的跳转。这可以通过使用 event.preventDefault() 方法来实现。

```javascript
// 阻止链接跳转的示例
const link = document.getElementById("myLink");

link.addEventListener("click", function (event) {
  event.preventDefault();
  console.log("Link clicked, but default behavior prevented");
});
```

在上面的例子中,当用户点击链接时,默认的链接跳转行为会被阻止,取而代之的是我们自定义的行为。

这两个概念在 JavaScript 事件处理中都非常重要:

- 事件委托可以帮助我们编写更高效的代码,减少事件处理程序的数量。
- preventDefault 可以帮助我们控制浏览器的默认行为,让我们的应用程序能够按照预期的方式工作。

掌握这两个概念对于编写健壮和高效的 JavaScript 代码非常有帮助。
