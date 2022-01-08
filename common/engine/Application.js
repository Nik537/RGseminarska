export class Application {

    constructor(canvas, glOptions) {
        this._update = this._update.bind(this);

        this.canvas = canvas;
        this._initGL(glOptions);

        this.then = 0;
        Promise.resolve(this.start()).then(
            () => requestAnimationFrame(this._update)
        );

    }

    _initGL(glOptions) {
        this.gl = null;
        try {
            this.gl = this.canvas.getContext('webgl2', glOptions);
        } catch (error) {
            debugger;
            console.log(error);
        }

        if (!this.gl) {
            console.log('Cannot create WebGL 2.0 context');
        }
    }

    _update(now) {
        now *= 0.001;
        this.deltaTime = now - this.then;
        this.then = now;
        this._resize();
        this.update();
        this.render();
        requestAnimationFrame(this._update);
    }

    _resize() {
        const canvas = this.canvas;
        const gl = this.gl;

        if (canvas.width !== canvas.clientWidth ||
            canvas.height !== canvas.clientHeight)
        {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

            this.resize();
        }
    }

    start() {
        // initialization code (including event handler binding)
    }

    update() {
        // update code (input, animations, AI ...)
    }

    render() {
        // render code (gl API calls)
    }

    resize() {
        // resize code (e.g. update projection matrix)
    }

}
