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
        await this.loader.load('../../common/models/onlyRoad/onlyRoad.gltf');
        //await this.loader.load('../../common/models/car/car.gltf');
        

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        await this.loader.load('../../common/models/onlyRoad/onlyRoad.gltf');
        this.car = await this.loader.loadNode(this.loader.defaultScene);
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
        this.camera.translation = vec3.fromValues(-0.2, 3, 7); //0,3,6
        this.camera.updateMatrix();

        this.camera.camera = new PerspectiveCamera();
        this.scene.addNode(this.camera);

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();

        //--------------------------------------------------------
        /*
        this.loader = new GLTFLoader();
        await this.loader.load('./blender/map2backup.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        this.tree = new Trees();

        await this.tree.build(this.loader, this.scene);

        await this.loader.load('./blender/ring.gltf');
        this.checkpoint = await this.loader.loadNode(this.loader.defaultScene);
        this.checkpoint.updateMatrix();

        await this.loader.load('./blender/car2backup.gltf');

        this.car = await this.loader.loadNode(this.loader.defaultScene);

        this.camera = new Node({
        translation: [-30, 30, 50],
        });
        this.camera.camera = new PerspectiveCamera();

        Object.assign(this.camera, {
            translation     :vec3.set(vec3.create(), -30, 30, 50),
            fov             : 1.5,
            maxFov          : 1.8,
            minFov          : 1,
            maxTranslation  : 7,
            yaw             : 9,
            pitch           : 0,
            roll            : 0,
            distanceFromCar : 50,
            zoom            : -20,
            offset          : 0,
            angle           : 0
        });

        Object.assign(this.car, {
            projection       : mat4.create(),
            rotation         : quat.fromEuler(quat.create(), 0, 0, 0),
            translation      : vec3.set(vec3.create(), -120, 4, -80),
            velocity         : vec3.set(vec3.create(), 0, 0, 0),
            mouseSensitivity : 0.002,
            heading          : 0,
            maxSpeed         : 3,
            friction         : 0.04,
            acceleration     : 0.2,
            yaw              : 0,
            pitch            : 0,
            roll             : 0,
            collided         : false
        });


        this.limit=0;

        this.timer = new Timer();

        this.cp = new Checkpoint(this.checkpoint, this.timer, laps);
        this.cp.reset();

        this.scene.addNode(this.car);
        this.scene.addNode(this.camera);
        this.scene.addNode(this.checkpoint);        
        
        this.light = new Light();
        this.scene.addNode(this.light);

        this.boost = 1000;
        this.boostClass = new Boost();

        this.boostClass.draw(this.boost);

        this.rot = 0;
        this.speed=0;
        this.maxSpeed = 210;

        this.speedometer = new Speedometer();

        this.initHandlers();
        this.time = performance.now();
        this.startTime = this.time;
        this.angle = this.car.pitch;
        this.lastKeyPressed=null;

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();


        load.style.display = 'none';
        //playAudio();
        */
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
