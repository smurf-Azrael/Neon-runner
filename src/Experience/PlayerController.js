import * as THREE from 'three'

import CameraController from "./CameraController.js"
import KinematicCharacterController from "./KinematicCharacterController.js"

class PlayerController {
    constructor(camera, physics) {
        if (!camera) {
            console.warn('No camera specified!'); return;
        } this.CAMERA = camera;

        if (!physics) {
            console.warn('No physics specified!'); return;
        } this.PHYSICS = physics;

        this._Initialize();
    }

    _Initialize() {
        this.spawn_position = new THREE.Vector3(0, 5, 0);
        this.position = new THREE.Vector3().copy(this.spawn_position);

        this.CAMERA_CONTROLLER = new CameraController(this.CAMERA);
        this.KINEMATIC_CHARACTER_CONTROLLER = new KinematicCharacterController(this.spawn_position, new THREE.Quaternion());

        this.PHYSICS.world.addCollisionObject(this.KINEMATIC_CHARACTER_CONTROLLER.body, 2, -1);
        this.PHYSICS.world.addAction(this.KINEMATIC_CHARACTER_CONTROLLER.controller);

        this.keys = {
            KeyS: false,
            KeyA: false,
            KeyD: false,
            KeyW: false,
            Space: false,
        };

        this._direction = new THREE.Vector3();
        this._tmp_vec = new Ammo.btTransform();

        this._AddEventListeners();
    }

    _AddEventListeners() {
        document.addEventListener('keydown', e => this.OnKeyDown(e));
        document.addEventListener('keyup', e => this.OnKeyUp(e));
        document.addEventListener('touchstart', e => this.OnTapScreen(e));
    }

    OnKeyDown(e) {
        if (this.keys[e.code] != null) {
            this.keys[e.code] = true;
        }
    }

    OnKeyUp(e) {
        if (this.keys[e.code] != null) {
            this.keys[e.code] = false;
            this.KINEMATIC_CHARACTER_CONTROLLER.controller.setWalkDirection(this._tmp_vec);
        }
    }

    GetForwardVector() {
        this.CAMERA.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        return this._direction;
    }

    GetSideVector() {
        this.CAMERA.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        this._direction.cross(this.CAMERA.up);
        return this._direction;
    }

    Update(t) {
        /* Position Offset */
        const offset = new THREE.Vector3();

        /* Get Current Position */
        const transform = this.KINEMATIC_CHARACTER_CONTROLLER.body.getWorldTransform();
        const pos = transform.getOrigin();

        /* Check if Player has Lost */
        if (pos.y() <= -40) {
            this.KINEMATIC_CHARACTER_CONTROLLER.Teleport(this.spawn_position);
            return;
        }

        /* Go Forward Only */
        // offset.add(this.GetForwardVector().multiplyScalar(t * this.KINEMATIC_CHARACTER_CONTROLLER.player_speed));

        if (document.pointerLockElement == document.body) {
            /* Free Roam Controls */
            if (this.keys["KeyW"]) offset.add(this.GetForwardVector().multiplyScalar(t * this.KINEMATIC_CHARACTER_CONTROLLER.player_speed));
            if (this.keys["KeyS"]) offset.sub(this.GetForwardVector().multiplyScalar(t * this.KINEMATIC_CHARACTER_CONTROLLER.player_speed));
            if (this.keys["KeyA"]) offset.sub(this.GetSideVector().multiplyScalar(t * this.KINEMATIC_CHARACTER_CONTROLLER.player_speed));
            if (this.keys["KeyD"]) offset.add(this.GetSideVector().multiplyScalar(t * this.KINEMATIC_CHARACTER_CONTROLLER.player_speed));
            if (this.keys["Space"]) this.KINEMATIC_CHARACTER_CONTROLLER.Jump();
        }

        const newTransform = this.KINEMATIC_CHARACTER_CONTROLLER.Move(offset);

        /* Update Camera and Player Position */
        const newPos = newTransform.getOrigin();
        const newPos3 = new THREE.Vector3(newPos.x(), newPos.y(), newPos.z());

        this.position.copy(newPos3);
        this.CAMERA.position.copy(newPos3);

        // Get Collisions
        // this.KINEMATIC_CHARACTER_CONTROLLER.GetCollidingObjects().forEach(o => console.log(o.kB));
    }
}

export default PlayerController