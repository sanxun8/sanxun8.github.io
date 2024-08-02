---
title: 第14章 DOM
---

文档对象模型（DOM, Document Object Model）是 HTML 和 XML 文档的编程接口。DOM 表示由多层节点构成的文档，通过它开发者可以添加、删除和修改页面的各个部分。脱胎于网景和微软早期的动态 HTML（DHTML, Dynamic HTML）, DOM 现在是真正跨平台、语言无关的表示和操作网页的方式。

DOM Level 1 在 1998 年成为 W3C 推荐标准，提供了基本文档结构和查询的接口。本章之所以介绍 DOM，主要因为它与浏览器中的 HTML 网页相关，并且在 JavaScript 中提供了 DOM API。

```
注意 IE8及更低版本中的DOM是通过COM对象实现的。这意味着这些版本的IE中，DOM对象跟原生JavaScript对象具有不同的行为和功能。
```
