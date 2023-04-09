import * as THREE from 'three'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import Sizes from './utils/Sizes.js'

class Renderer {
    constructor(scene, camera) {
        if (!scene) {
            console.warn('No scene specified!'); return;
        }
        this._scene = scene;

        if (!camera) {
            console.warn('No camera specified!'); return;
        }
        this._camera = camera;

        this.sizes = new Sizes();

        this.instance = new THREE.WebGLRenderer({ antialias: true });
        this.instance.setPixelRatio(window.devicePixelRatio);
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.toneMapping = THREE.NoToneMapping;
        this.sizes.dom_element.appendChild(this.instance.domElement);
    }

    InitializePostFX() {
        this.composer = new EffectComposer(this.instance);
        this.composer.addPass(new RenderPass(this._scene, this._camera));
        this.composer.addPass(new UnrealBloomPass(new THREE.Vector2(this.sizes.width, this.sizes.height), 1.8, 0.3, 0.1));
    }

    Resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(window.devicePixelRatio);
    }

    Update() {
        if (this.composer) this.composer.render();
        else this.instance.render(this._scene, this._camera);
    }
}

export default Renderer