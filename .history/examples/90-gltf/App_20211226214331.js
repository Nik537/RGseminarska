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
        
        await this.loader.load('../../common/models/carRoad2/carRoad2.gltf');
        
        this.scene = await this.loader.loadScene(this.loader.defaultScene);
     
        this.camera = new Node();
        //if(pov) this.camera.translation = vec3.fromValues(0,2,0);
        //else
        //this.camera.rotation = vec3.fromValues(0, 0, 0);
        this.camera.translation = vec3.fromValues(-0.21, 3, 7); //0,3,6
        this.camera.updateMatrix();

        this.camera.camera = new PerspectiveCamera();

        this.car = await this.loader.loadNode('carbody');
        this.scene.addNode(this.car);
        

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

update() {
    if (this.car) {
        this.time = performance.now();
        const dt = (this.time - this.startTime) *0.04;
        this.startTime = this.time;

        const c = this.car;
        this.speedometer.draw(this.speed);
        
        if (this.cp.finished) {
            this.keys['KeyW'] = false;
            this.keys['KeyS'] = false;
            this.keys['KeyA'] = false;
            this.keys['KeyD'] = false;
            
            var delta = dt/10;
            var sensitivity = 0.000141;

            this.camera.offset +=360 * delta * sensitivity;
            this.rot+=360 * delta * sensitivity; 
            this.camera.angle+=0.1;

            quat.fromEuler(this.camera.rotation, 0, (this.camera.angle+this.angle)*2, 0);
            var rotZ = Math.cos(this.rot);
            var rotX = Math.sin(this.rot);
            this.camera.translation[0] = this.car.translation[0] - (this.camera.zoom * rotX);
            this.camera.translation[1] = this.car.translation[1] + this.camera.yaw;
            this.camera.translation[2] = this.car.translation[2] - (this.camera.zoom * rotZ);
          
        }

        if (this.timer.getTime()<0) {
            this.keys['KeyW'] = false;
            this.keys['KeyS'] = false;
            this.keys['KeyA'] = false;
            this.keys['KeyD'] = false;
            this.speed=0;
        }

        this.timer.update();
        this.cp.update(this.car, this.keys);

        let angles = this.getEuler(c.rotation);
        
        const forward = vec3.set(vec3.create(), Math.sin(angles[1]), 0, -Math.cos(angles[1]));
       
        if (this.keys['KeyR']) {
            this.reset();
        }

        if (this.keys['KeyC'] && this.boost>0 && this.speed > 0) {
            this.car.maxSpeed=5;
            this.camera.maxFov=2.2;
            laps<=0? this.boost=0:this.boost-=3/laps;
            this.maxSpeed=300;
            this.boostClass.draw(this.boost);
        } else {
            this.car.maxSpeed=3;
            this.camera.maxFov=1.8;
            this.maxSpeed = 210;
            if (this.speed>this.maxSpeed) {
                this.speed--;
            }
        }

        let acc = vec3.create();
        if (this.keys['KeyW']) {
            if (this.camera.camera.fov<this.camera.maxFov){
                this.camera.camera.fov+=0.005;
            }
            this.car.maxSpeed=3;
            this.speed<this.maxSpeed? this.speed+=Math.abs(this.car.velocity[0])+Math.abs(this.car.velocity[1])+Math.abs(this.car.velocity[2]):null;
            vec3.add(acc, acc, forward);
        }
        if (this.keys['KeyS']) {
            vec3.sub(acc, acc, forward);
            this.maxSpeed = 80;
            this.speed<this.maxSpeed? this.speed+=Math.abs(this.car.velocity[0])+Math.abs(this.car.velocity[1])+Math.abs(this.car.velocity[2]):this.speed-=2;
            this.car.maxSpeed=2;
        }

        if(this.keys['KeyD']) {
            if (this.turn()) {
                c.pitch-=1;
            }
        }
        if (this.keys['KeyA']) {
            if (this.turn()) {
                c.pitch+=1;
            }
        }

        if (this.keys['Space']) {
            this.car.acceleration=0.05;
        } else {
            if (this.car.acceleration<0.2) {
                this.car.acceleration+=0.01;
            }
        }
    
        vec3.scaleAndAdd(c.velocity, c.velocity, acc,2*dt*c.acceleration);
        
        if (!this.keys['KeyW'] && !this.keys['KeyS']) {
            vec3.scale(c.velocity, c.velocity, 1 - c.friction);
            if (this.camera.camera.fov != this.camera.fov) {
                this.camera.camera.fov-=0.005;
            }
            if (this.speed > 0 ){
                this.speed-=3;
            }
        }

        if (this.camera.camera.fov>this.camera.maxFov) {
            this.camera.camera.fov-=0.005;
        }
        const len = vec3.len(c.velocity);
        if (len > c.maxSpeed) {
            vec3.scale(c.velocity, c.velocity, c.maxSpeed / len);
        }

        this.tree.collision(c, dt, angles, this.lastKeyPressed);
        this.rotate(c, this.car.yaw, c.pitch*2, 0);
        this.moveCamera(dt);

        this.camera.camera.updateMatrix();
        this.camera.updateMatrix();
        c.updateMatrix();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
});
