import Sizes from "./utils/Sizes.js";

class CameraController {
    constructor(camera) {
        if (!camera) {
            console.warn('No camera specified!'); return;
        }
        this._camera = camera;

        this.sizes = new Sizes();

        this._x = 0;
        this._y = 0;
        this._dx = 0;
        this._dy = 0;
        this._can_move_camera = true;

        document.addEventListener("touchstart", e => this.OnTouchStart(e));
        document.addEventListener("touchmove", e => this.OnTouchMove(e));
        this.sizes.dom_element.addEventListener("click", () => this.OnMouseDown());
        document.addEventListener("mousemove", e => this.OnMouseMove(e));
    }
  
    OnTouchStart(e) {
        e.preventDefault();

        if (e.touches[0].clientX > window.innerWidth * 0.5) {
            if (e.touches.length >= 2) {
              this._can_move_camera = true;
            } else {
              this._can_move_camera = false;
            }
            
            return;
        }

        this._x = e.touches[0].clientX;
        this._y = e.touches[0].clientY;
        this._dx = this._x;
        this._dy = this._y;

        this._can_move_camera = true;
    }

    OnTouchMove(e) {
        e.preventDefault();

        if (!this._can_move_camera) return;

        this._dx = e.touches[0].clientX - this._x;
        this._dy = e.touches[0].clientY - this._y;
        this._x += this._dx;
        this._y += this._dy;

        this._camera.rotation.y -= this._dx * 0.005;
        this._camera.rotation.x -= this._dy * 0.003;
    }

    OnMouseDown() {
        document.body.requestPointerLock();
    } 

    OnMouseMove(e) {
        if (document.pointerLockElement == document.body) {
            this._camera.rotation.y -= e.movementX / 500;

            this._camera.rotation.x = Math.max(Math.min(this._camera.rotation.x - e.movementY / 500, 1.53), -1.55);
        }
    }
}

export default CameraController