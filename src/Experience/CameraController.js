import DOMElements from "../DOMElements.js";
import Sizes from "../utils/Sizes";

class CameraController {
    constructor(camera) {
        if (!camera) {
            console.warn('No camera specified!'); return;
        } this.CAMERA = camera;

        this._Initialize();
    }

    _Initialize() {
        this.sizes = new Sizes();

        this._can_move_camera = true;

        this._AddEventListeners();
    }

    _AddEventListeners() {
        document.body.addEventListener("click", () => this.OnMouseDown());
        document.addEventListener("mousemove", e => this.OnMouseMove(e));
    }

    OnMouseDown() {
        document.body.requestPointerLock();
    } 

    OnMouseMove(e) {
        if (document.pointerLockElement == document.body) {
            this.CAMERA.rotation.y -= e.movementX / 500;
            this.CAMERA.rotation.x = Math.max(Math.min(this.CAMERA.rotation.x - e.movementY / 500, 1.53), -1.55);
        }
    }
}

export default CameraController