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