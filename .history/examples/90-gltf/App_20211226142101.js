import {Application} from '../../common/engine/Application.js';

import {GLTFLoader} from './GLTFLoader.js';
import {PerspectiveCamera} from './PerspectiveCamera.js';
import {Renderer} from './Renderer.js';

import {Node} from './Node.js'

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

class App extends Application {

    async start() {

        this.loader = new GLTFLoader();
        var model = await this.loader.load('../../common/models/carRoad/carRoad.gltf');
        //await this.loader.load('../../common/models/car/car.gltf');
        

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        /*
        this.camera = await this.loader.loadNode('Camera');

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }
        */
       //model.rotation.x += 30;
       
        this.camera = new Node();
        //if(pov) this.camera.translation = vec3.fromValues(0,2,0);
        //else
        //this.camera.rotation = vec3.fromValues(0, 0, 0);
        this.camera.translation = vec3.fromValues(-0.5, 3, 7); //0,3,6
        this.camera.updateMatrix();

        this.camera.camera = new PerspectiveCamera();
        this.scene.addNode(this.camera);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();
    }

    render() {
        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize() {
        const w = this.canvas.clientWidth;
        const h = this.canvas.clientHeight;
        const aspectRatio = w / h;

        if (this.camera) {
            this.camera.camera.aspect = aspectRatio;
            this.camera.camera.updateMatrix();
        }
    }

}


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
});
