import * as THREE from 'three'

import Physics from './Physics.js';
import RigidBody from './Rigidbody.js';

import DOMElements from '../DOMElements.js';
import Sizes from './utils/Sizes.js';

import Camera from './Camera.js';
import Renderer from './Renderer.js';
import World from './World.js';
import PlayerController from './PlayerController.js';

class Game {
    constructor() {
        this.sizes = new Sizes(DOMElements.screens.gameScreen);

        this._InitializeScene();
        this._InitializeCamera();
        this._InitializeRenderer();

        this._clock = new THREE.Clock();

        this._physics = new Physics();

        /* Light */
        let light = new THREE.DirectionalLight(0xffffff, 1.0);
        this._scene.add(light);

        light = new THREE.AmbientLight(0xffffff, 0.7);
        this._scene.add(light);

        this._world = new World(this._physics, this._scene);

        this._player_controller = new PlayerController(this._camera.instance, this._physics);
        this._scene.add(this._player_controller.player_mesh)

        window.addEventListener('resize', () => this.Resize());
        window.requestAnimationFrame(() => this.Update());
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

    Update() {
        window.requestAnimationFrame(() => this.Update());

        const deltaT = this._clock.getDelta();
        const elapsedT = this._clock.getElapsedTime();

        this._physics.Update(deltaT);
        this._renderer.Update();
        this._player_controller.Update(deltaT);
        this._world.Update(elapsedT);

        // this._camera.instance.position.z += deltaT * 10.0;
    }
}

export default Game;