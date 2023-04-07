import * as THREE from 'three'

import Physics from './Physics.js';
import RigidBody from './Rigidbody.js';

import DOMElements from '../DOMElements.js';
import Sizes from './utils/Sizes.js';

import Camera from './Camera.js';
import Renderer from './Renderer.js';
import PlayerController from './PlayerController.js';

class Game {
    constructor() {
        this.sizes = new Sizes(DOMElements.screens.gameScreen);

        this._InitializeScene();
        this._InitializeCamera();
        this._InitializeRenderer();

        this._clock = new THREE.Clock();

        this._physics = new Physics();

        /* Ground */
        const ground_size = new THREE.Vector3(15, 0.5, 15);

        const ground = new THREE.Mesh(
            new THREE.BoxGeometry(ground_size.x, ground_size.y, ground_size.z),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        this._scene.add(ground);

        const rb_ground = new RigidBody()
        rb_ground.CreateBox(0, ground.position, ground.quaternion, ground_size);
        rb_ground.SetRestitution(0.99);
        this._physics.world.addRigidBody(rb_ground.body, 1, -1);
        rb_ground.body.needUpdate = true;

        /* Box */
        const box_size = new THREE.Vector3(1, 1, 1);

        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(box_size.x, box_size.y, box_size.z),
            new THREE.MeshBasicMaterial({ color: 0xfff000 })
        );
        this.box.position.set(0, 5, 0);
        this._scene.add(this.box);

        this.rb_box = new RigidBody();
        this.rb_box.CreateBox(1, this.box.position, this.box.quaternion, box_size);
        this.rb_box.SetRestitution(0.25);
        this.rb_box.SetFriction(1);
        this.rb_box.SetRollingFriction(5);
        this._physics.world.addRigidBody(this.rb_box.body);

        this.tmp_transform = new Ammo.btTransform();

        /* Light */
        let light = new THREE.DirectionalLight(0xffffff, 1.0);
        this._scene.add(light);

        light = new THREE.AmbientLight(0xffffff, 0.7);
        this._scene.add(light);

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
        // this._renderer.InitializePostFX();
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

        this._renderer.Update();
        this._physics.Update(deltaT);
        this._player_controller.Update(deltaT);

        this.rb_box.motion_state.getWorldTransform(this.tmp_transform);
        const pos = this.tmp_transform.getOrigin();
        const quat = this.tmp_transform.getRotation();
        const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
        const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
        
        this.box.position.copy(pos3);
        this.box.quaternion.copy(quat3);
    }
}

export default Game;