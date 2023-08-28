import * as THREE from 'three'

import Camera from './Camera.js'
import DOMElements from '../DOMElements.js'
import Physics from './Physics.js'
import PlayerController from './PlayerController.js'
import Renderer from './Renderer.js'
import Sizes from '../utils/Sizes.js'
import World from './World.js'

class Experience {
    constructor() {
        this.sizes = new Sizes(DOMElements.game.canvas_container);

        this._InitializeScene();
        this._InitializeCamera();
        this._InitializeRenderer();   
        this._InitializePhysics();
        this._InitializePlayerControls();
        this._InitializeWorld();

        this._AddEventListeners();
    }

    _InitializeScene() {
        this._SCENE = new THREE.Scene();
    }

    _InitializeCamera() {
        this._CAMERA = new Camera();
    }

    _InitializeRenderer() {
        this._RENDERER = new Renderer(this._SCENE, this._CAMERA.instance);
        this._RENDERER.InitializePostFX();
    }

    _InitializePhysics() {
        this._PHYSICS = new Physics();
    }

    _InitializePlayerControls() {
        this._PLAYER_CONTROLLER = new PlayerController(this._CAMERA.instance, this._PHYSICS);
    }

    _InitializeWorld() {
        this._CLOCK = new THREE.Clock();
        this._WORLD = new World(this._PHYSICS, this._SCENE, this._PLAYER_CONTROLLER);
    }

    _AddEventListeners() {
        window.addEventListener('resize', () => this.Resize());
        window.requestAnimationFrame(() => this.Update());
    }

    Resize() {
        this.sizes.Resize();
        this._CAMERA.Resize();
        this._RENDERER.Resize();
    }

    Update() {
        window.requestAnimationFrame(() => this.Update());

        this._RENDERER.Update();

        const deltaT = this._CLOCK.getDelta();
        const elapsedT = this._CLOCK.getElapsedTime();

        this._PHYSICS.Update(deltaT);
        this._PLAYER_CONTROLLER.Update(deltaT);
        this._WORLD.Update(deltaT, elapsedT, this._PLAYER_CONTROLLER);

    }
}

export default Experience;