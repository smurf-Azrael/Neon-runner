import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import Sizes from './utils/Sizes.js';

class Camera {
    constructor() {
        this.sizes = new Sizes();
        this.instance = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height, 0.1, 500);
        this.instance.position.set(0, 2, 10);
        this.instance.rotation.order = 'YXZ';
        // this.controls = new OrbitControls(this.instance, this.sizes.dom_element);
    }

    Resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height;
        this.instance.updateProjectionMatrix();
    }

    Update() {
        if (this.controls) this.controls.update();
    }
}

export default Camera;