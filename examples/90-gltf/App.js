import { Application } from '../../common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Renderer } from './Renderer.js';

import { Node } from './Node.js'
import { quat } from '../../lib/gl-matrix-module.js';

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;



class App extends Application {

    async start() {
        this.loader = new GLTFLoader();

        // await this.loader.load('../../common/models/carRoad2/carRoad2.gltf');
        // await this.loader.load('../../common/models/carRoad32/carRoad32.gltf');
        // await this.loader.load('../../common/models/test/carRoad3.gltf');
        //  await this.loader.load('../../common/models/test/test.gltf');
        // await this.loader.load('../../common/models/test2/test2.gltf');
        // await this.loader.load('../../common/models/kvadratnaCestaLight/kvadratnaCestaLight.gltf');
        //await this.loader.load('../../common/models/grass/grass.gltf');
        await this.loader.load('../../common/models/skyBox/skyBox.gltf');
        //await this.loader.load('../../common/models/ograja/ograja.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);

        this.car = await this.loader.loadNode('carbody'); //TO JE TREBA PREMIKAT

        this.camera = new Node();
        this.cameraRotator = new Node();
        this.car.addChild(this.cameraRotator);
        this.cameraRotator.addChild(this.camera);
        // this.car.addChild(this.camera);
        //if(pov) this.camera.translation = vec3.fromValues(0,2,0);
        //else
        //this.camera.rotation = vec3.fromValues(0, 0, 0);
        this.camera.translation = vec3.fromValues(-0.21, 4, -7); //0,3,6
        this.camera.updateMatrix();
        // this.camera.rotation = vec3.fromValues(0, 0, 0);


        this.camera.camera = new PerspectiveCamera();


        this.camera.updateMatrix();

        this.cubes = [];
        for(let i = 1; i <= 14; i++){
            this.cubes[i-1] = await this.loader.loadNode('Ovira'+ i);
        }
        this.cubes[14] = await this.loader.loadNode('Ovira1.001');
        this.cubes[15] = await this.loader.loadNode('Ovira1.002');
        this.cubes[16] = await this.loader.loadNode('Ovira1.003');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira2'); // nared to s forom
        //this.cube1 = await this.loader.loadNode('Ovira3');
        //this.cube1 = await this.loader.loadNode('Ovira4');
        //this.cube1 = await this.loader.loadNode('Ovira5');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube1 = await this.loader.loadNode('Ovira1');
        //this.cube15 = await this.loader.loadNode('Ovira1.001');
        //this.cube16 = await this.loader.loadNode('Ovira1.002');
        //this.cube17 = await this.loader.loadNode('Ovira1.003');
        

        


        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);
        this.resize();
        this.initHandlers();

        this.speed = 0.0;
        this.rotation = 0;
        this.cameraRotation = 0;
        this.maxBoost = 2.5;

        this.maxSpeed = 50;
        this.acceleration = this.maxSpeed * 0.016;
        this.rotatonSpeed = this.maxSpeed * 0.03;

        this.boost = 1;
        this.rotate = true;
    }

    initHandlers() {
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        this.keys = {};
        this.keys["KeyR"] = true;

        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    keyDownHandler(e) {
        if (e !== undefined) {
            // console.log(e.code);
            this.keys[e.code] = true;
        }
    }
    keyUpHandler(e) {
        this.keys[e.code] = false;
        if (e.code == "KeyR") {
            this.rotate = true;
        }
        if (e.code == "Space") {
            this.drift = false;
        }
    }

    rotateCamera() {
        if (this.rotate) {
            this.camera.camera.matrix = mat4.rotateY(this.camera.camera.matrix, this.camera.camera.matrix, Math.PI);
            this.rotate = false;
        }
    }

    collision(a) {
        for (const cube of a) {
            if ((this.car.translation[2] - cube.translation[2] < 1 && this.car.translation[2] - cube.translation[2] > -1) && //naprej, nazaj
                (this.car.translation[0] - cube.translation[0] < 2 && this.car.translation[0] - cube.translation[0] > -2)) { //levo, desno
                return true
            }
        }
        return false;
    }

    calcAngleX(x) {
        if (Math.abs(x) > Math.PI * 0.5) {
            if (x > 0) {
                return ((Math.PI * 2) - x) * -1;
            } else {
                return (-Math.PI * 2) - x;
            }
        }
        return x;
    }

    calcAngleY(y) {
        if (Math.abs(y) > Math.PI * 0.5) {
            if (y > 0) {
                return ((Math.PI * 2) - y) * -1;
            } else {
                return (-Math.PI * 2) - y;
            }
        }
        return y;
    }

    odbojX(a) {
        this.rotation = (this.rotation + 2 * Math.PI) % (2 * Math.PI);
        console.log(Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5));
        // if (Math.abs(Math.abs(2 * Math.PI - this.rotation - this.rotation) - Math.PI) > 2.1 && false) {
        if (Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5) > 0.4) {
            this.car.translation[0] += (this.car.translation[0] < 0) ? a : -a;


            this.cameraRotation += this.rotation - ((2 * Math.PI) - this.rotation);
            this.cameraRotation = this.calcAngleX(this.cameraRotation);

            this.rotation = 2 * Math.PI - this.rotation;
            this.speed /= 2;
        }
        else {
            this.speed = 0 - this.speed;
        }
    }

    odbojY(a) {
        this.rotation = (this.rotation + (2 * Math.PI)) % (2 * Math.PI);
        console.log(Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5));
        if (Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5) < 0.08) {
            this.car.translation[2] += (this.car.translation[2] < 2) ? a : -a;


            this.cameraRotation += this.rotation - (Math.PI - this.rotation);
            this.cameraRotation = this.calcAngleY(this.cameraRotation);

            this.rotation = Math.PI - this.rotation;
            this.speed /= 2;
        }
        else {
            this.speed = 0 - this.speed;
        }
    }

    zidcollision() {
        if (this.car.translation[0] < -119 || this.car.translation[0] > 119) {
            this.odbojX(1);
            return true;
        }
        if (this.car.translation[2] < -111 || this.car.translation[2] > 111) {
            this.odbojY(1);
            return true;
        }

        if (this.car.translation[0] < 96 && this.car.translation[0] > -96 && this.car.translation[2] < 88 && this.car.translation[2] > -88) {
            if (Math.abs(this.car.translation[0]) > Math.abs(this.car.translation[2])) {
                this.odbojX(-1);
            }
            else {
                this.odbojY(-1);
            }
            return true;
        }
        return false;

        // if (this.car.translation[0] < -119 || this.car.translation[0] > 119 || this.car.translation[2] < -111 || this.car.translation[2] > 111) {
        //     return true;
        // } else if (this.car.translation[0] < -96 || this.car.translation[0] > 96 || this.car.translation[2] < -88 || this.car.translation[2] > 88) {
        //     return false;
        // } else {
        //     return true;
        // }
    }

    driftHandler() {
        if (!this.drift) {
            this.drift = true;
            if (this.keys['KeyA']) {
                this.driftRotation = this.rotatonSpeed * (this.speed / this.maxSpeed) * this.deltaTime * 1.5;
            } else if (this.keys['KeyD']) {
                this.driftRotation = -this.rotatonSpeed * (this.speed / this.maxSpeed) * this.deltaTime * 1.5;
            }
            else {
                this.driftRotation = 0;
            }
        }
    }

    movementHandler() {
        if (this.zidcollision()) {
            // console.log("zid");
        } else if (this.speed != 0 && this.collision(this.cubes)) {
            this.speed = 0 - this.speed;
        }
        else if (this.drift) {
            if (this.driftRotation == 0) {
                this.speed *= 0.95;
            }
            this.rotation += this.driftRotation / 2;
            if (this.keys['KeyA']) {
                this.car.translation[2] += this.maxSpeed * Math.sin(this.rotation) * this.deltaTime * 0.1;
                this.car.translation[0] -= this.maxSpeed * Math.cos(this.rotation) * this.deltaTime * 0.1;
                if (this.driftRotation > 0) {
                    this.rotation += this.driftRotation / 2;
                } else {
                    this.rotation -= this.driftRotation / 4;
                }
            } else if (this.keys['KeyD']) {
                this.car.translation[2] -= this.maxSpeed * Math.sin(this.rotation) * this.deltaTime * 0.1;
                this.car.translation[0] += this.maxSpeed * Math.cos(this.rotation) * this.deltaTime * 0.1;
                if (this.driftRotation < 0) {
                    this.rotation += this.driftRotation / 2;
                } else {
                    this.rotation -= this.driftRotation / 4;
                }
            }
        } else {
            if (this.keys['KeyW']) {
                if (this.speed < 0) {
                    this.speed *= 0.95;
                }
                this.speed += this.acceleration;
            } else if (this.keys['KeyS']) {
                if (this.speed > 0) {
                    this.speed *= 0.95;
                }
                this.speed -= this.acceleration;
            }
            else {
                this.speed *= 0.995;
            }
            if (this.keys['KeyA']) {
                this.rotation += this.rotatonSpeed * (this.speed / this.maxSpeed) * this.deltaTime;
            } else if (this.keys['KeyD']) {
                this.rotation -= this.rotatonSpeed * (this.speed / this.maxSpeed) * this.deltaTime;
            }
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        } else if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
        }

        this.car.translation[0] -= this.speed * Math.sin(this.rotation) * this.deltaTime * this.boost;
        this.car.translation[2] -= this.speed * Math.cos(this.rotation) * this.deltaTime * this.boost;
        this.car.updateMatrix();
        this.car.rotateY(this.rotation);
        this.cameraRotator.updateMatrix();
        this.cameraRotation %= (2 * Math.PI);
        this.cameraRotation *= 1 - (this.deltaTime * 2);
        this.cameraRotator.rotateY(this.cameraRotation);
    }

    controlsHandler() {
        if (this.keys['ShiftLeft'] && this.boost < this.maxBoost) {
            this.boost += this.maxBoost * this.deltaTime * 2;
        } else if (this.boost > 1) {
            this.boost -= this.maxBoost * this.deltaTime * 2;
        }

        if (this.keys['KeyP']) {
            // this.camera.translation = vec3.fromValues(0, 2, 0);
            // this.camera.translation = vec3.fromValues(
            //     this.car.translation[0],
            //     this.car.translation[1] + 2,
            //     this.car.translation[2]);
        }
        if (this.keys['KeyO']) {
            this.camera.translation = vec3.fromValues(0, 3, 7);
        }
        if (this.keys['KeyR']) {
            this.rotateCamera();
        }
        if (this.keys['Space']) {
            this.driftHandler();
        }
    }


    update() {
        this.keyDownHandler();
        this.controlsHandler();
        this.movementHandler();
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
// TODO premikanje avta
// Ta update je iz drugega projektna, tu je za pomoc
/*
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
*/

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas');
    const app = new App(canvas);
});
