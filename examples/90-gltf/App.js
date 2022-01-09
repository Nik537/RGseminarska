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

        // await this.loader.load('../../common/models/skyBox/skyBox.gltf');
        await this.loader.load('../../common/models/spot/spot.gltf');

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

        this.points = 0;
        this.lastposition = 1;
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
        // console.log(Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5));
        // if (Math.abs(Math.abs(2 * Math.PI - this.rotation - this.rotation) - Math.PI) > 2.1 && false) {
        if (Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5) > 0.4) {
            this.car.translation[0] += (this.car.translation[0] < 0) ? a : -a;


            this.cameraRotation += this.rotation - ((2 * Math.PI) - this.rotation);
            this.cameraRotation = this.calcAngleX(this.cameraRotation);

            this.rotation = 2 * Math.PI - this.rotation;
            this.speed /= 2;
            this.updatePoints(-1);
        }
        else {
            this.speed = 0 - this.speed;
            this.updatePoints(-2);
        }
    }

    odbojY(a) {
        this.rotation = (this.rotation + (2 * Math.PI)) % (2 * Math.PI);
        // console.log(Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5));
        if (Math.abs(Math.abs(this.rotation / Math.PI - 1) - 0.5) < 0.08) {
            this.car.translation[2] += (this.car.translation[2] < 2) ? a : -a;


            this.cameraRotation += this.rotation - (Math.PI - this.rotation);
            this.cameraRotation = this.calcAngleY(this.cameraRotation);

            this.rotation = Math.PI - this.rotation;
            this.speed /= 2;
            this.updatePoints(-1);
        }
        else {
            this.speed = 0 - this.speed;
            this.updatePoints(-2);
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

    updatePoints(x) {
        this.points += x;
        console.log((x > 0 ? "Po novem krogu imate število točk: " : "Po trku imate število točk: ") + this.points);
    }

    movementHandler() {
        if (this.zidcollision()) {
            // console.log("zid");
        } else if (this.speed != 0 && this.collision(this.cubes)) {
            this.speed = 0 - this.speed;
            this.updatePoints(-2);
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
        if (this.keys['KeyQ']) {
            console.log(this.car.translation);
        }
    }

    checkLap() {
        if (this.lastposition == 0 && this.car.translation[0] < 0 && this.car.translation[2] < 0) {
            this.lastposition = 1;
            this.updatePoints(10);
        } else if (this.lastposition == 1 && this.car.translation[0] > 0 && this.car.translation[2] < 0) {
            this.lastposition = 2;
        } else if (this.lastposition == 2 && this.car.translation[0] > 0 && this.car.translation[2] > 0) {
            this.lastposition = 3;
        } else if (this.lastposition == 3 && this.car.translation[0] < 0 && this.car.translation[2] > 0) {
            this.lastposition = 0;
        }
    }

    update() {
        this.keyDownHandler();
        this.controlsHandler();
        this.movementHandler();
        this.checkLap();
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
