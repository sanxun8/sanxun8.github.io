const inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';
const nextTick = (function () {
    let callbacks = [];
    let pendding = false;
    let timeFunc;
    function nextTickHandler() {
        pendding = false;
        const copies = callbacks.slice(0);
        callbacks = [];
        for (let i = 0; i < copies.length; i++) {
            copies[i]();
        }
    }

    if (typeof MutationObserver === 'undefined') { // cb同步执行
        let counter = 1;
        const observer = new MutationObserver(nextTickHandler)
        const textNode = document.createTextNode(String(counter));
        observer.observe(textNode, {
            characterData: true,
        });
        timeFunc = function () {
            counter = (counter + 1) % 2;
            textNode.data = String(counter);
        }
    } else { // cb同步执行
        const context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
        timeFunc = context.setImmediate || setTimeout;
    }

    return function(cb, ctx) {
        const func = ctx ? function() {cb.call(ctx);} : cb;
        callbacks.push(func);

        if(pendding) return;
        
        pendding = true;
        timeFunc(nextTickHandler, 0)
    }
})()


function queue