import * as THREE from 'three'

import DOMElements from '../DOMElements.js';
import Sizes from './utils/Sizes.js';

import Camera from './Camera.js';
import Renderer from './Renderer.js';

class Game {
    constructor() {
        this.sizes = new Sizes(DOMElements.screens.gameScreen);

        this._InitializeScene();
        this._InitializeCamera();
        this._InitializeRenderer();

        this._clock = new THREE.Clock();

        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        );
        this._scene.add(cube);

        this._camera.instance.position.z += 5;

        let light = new THREE.DirectionalLight(0xffffff, 1.0);
        this._scene.add(light);

        light = new THREE.AmbientLight(0xffffff, 0.7);
        this._scene.add(light);

        window.addEventListener('resize', () => this.Resize());
        window.requestAnimationFrame(t => this.Update(t));
    }

    _InitializeScene() {
        this._scene = new THREE.Scene();
    }

    _InitializeCamera() {
        this._camera = new Camera();
    }

    _InitializeRenderer() {
        this._renderer = new Renderer(this._scene, this._camera.instance);
        this._renderer.InitializePostFX();
    }

    Resize() {
        this.sizes.Resize();
        this._camera.Resize();
        this._renderer.Resize();
    }

    Update(t) {
        window.requestAnimationFrame(t => this.Update(t));

        const deltaT = this._clock.getDelta();
        const elapsedT = this._clock.getElapsedTime();

        this._camera.Update();
        this._renderer.Update();
    }
}

export default Game;