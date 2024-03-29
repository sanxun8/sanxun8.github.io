class CanvasProcess {
    constructor(layerMediator) {
        this.layerMediator = layerMediator;
    }
    getCanvas() {
        return {};

        const query = wx.createSelectorQuery()
        query.select('#myCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                const canvas = res[0].node
                // const dpr = wx.getSystemInfoSync().pixelRatio
                // canvas.width = res[0].width * dpr
                // canvas.height = res[0].height * dpr
                // ctx.scale(dpr, dpr)

                return canvas;
            })
    }
    getContext(canvas) {
        return { context: 'context' };

        return canvas.getContext('2d');
    }
    draw(ctx) {
        const canvas = this.getCanvas();
        const ctx = this.getContext(canvas);
        this.layerMediator.notify(ctx);
    }
}

let zIndex = 0
class TextLayer {
    constructor() {
        this.zIndex = zIndex++;

    }

    draw(ctx) {
        console.log('文字绘制了', ctx);
    }
}

class LayerMediator {
    constructor() {
        this.layers = [];
    }
    copyLayer(layer) {
        this.layers.push(cloneDeep(layer));
    }
    clearnLayer() {
        this.layers = [];
    }
    addLayer(layer) {
        this.layers.push(layer);
    }
    notify(ctx) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            layer.draw(ctx);
        }
    }
}



function handleAddText() {
    const layer = new TextLayer();
    layerMediator.addLayer(layer);
    canvasProcess.draw();
}
function handleDraw() {
    canvasProcess.draw();
}

const layerMediator = new LayerMediator()
const canvasProcess = new CanvasProcess(layerMediator)
handleAddText();
