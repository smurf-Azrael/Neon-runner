import * as THREE from 'three'

import CameraController from "./CameraController.js"
import KinematicCharacterController from "./KinematicCharacterController.js"

class PlayerController {
    constructor(camera, physics) {
        if (!camera) {
            console.warn('No camera specified!'); return;
        }
        this._camera = camera;

        if (!physics) {
            console.warn('No physics specified!'); return;
        }
        this._physics = physics;

        this.player_mesh = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshBasicMaterial({ color: 0x00ccff })
        );
        this.player_mesh.position.set(3, 3, 3);
        
        this._camera_controller = new CameraController(this._camera);
        this._kinematic_character_controller = new KinematicCharacterController(this.player_mesh.position, this.player_mesh.quaternion);

        this._physics.world.addCollisionObject(this._kinematic_character_controller.body);
        this._physics.world.addAction(this._kinematic_character_controller.controller);

        this._keys = {};
        this._direction = new THREE.Vector3();
        this._tmp_vec = new Ammo.btTransform();
    
        document.addEventListener('keydown', e => this.OnKeyDown(e));
        document.addEventListener('keyup', e => this.OnKeyUp(e));
        document.addEventListener('touchstart', e => this.OnTapScreen(e));
    }

    OnKeyDown(e) { this._keys[e.code] = true; }

    OnKeyUp(e) {
        this._keys[e.code] = false;
        this._kinematic_character_controller.controller.setWalkDirection(this._tmp_vec);
    }

    OnTapScreen(e) {
        let can_jump = false;

        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].clientX > window.innerWidth * 0.5) can_jump = true;
        }

        if (can_jump) this._kinematic_character_controller.Jump();
    }

    GetForwardVector() {
        this._camera.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        return this._direction;
    }

    GetSideVector() {
        this._camera.getWorldDirection(this._direction);
        this._direction.y = 0;
        this._direction.normalize();
        this._direction.cross(this._camera.up);
        return this._direction;
    }

    Update(t) {
        /* Position Offset */
        const direction = new THREE.Vector3();

        /* Get Current Position */
        const transform = this._kinematic_character_controller.body.getWorldTransform();
        const pos = transform.getOrigin();

        /* Check if Player has Lost */
        if (pos.y() <= -40) {
            this._kinematic_character_controller.Teleport(new THREE.Vector3(0, 5, 0));
        }

        /* Go Forward Only */
        // direction.add(this.GetForwardVector().multiplyScalar(t * this._kinematic_character_controller.player_speed));

        if (document.pointerLockElement == document.body) {
            /* Free Roam Controls */
            if (this._keys["KeyW"]) direction.add(this.GetForwardVector().multiplyScalar(t * this._kinematic_character_controller.player_speed));
            if (this._keys["KeyS"]) direction.sub(this.GetForwardVector().multiplyScalar(t * this._kinematic_character_controller.player_speed));
            if (this._keys["KeyA"]) direction.sub(this.GetSideVector().multiplyScalar(t * this._kinematic_character_controller.player_speed));
            if (this._keys["KeyD"]) direction.add(this.GetSideVector().multiplyScalar(t * this._kinematic_character_controller.player_speed));
            if (this._keys["Space"]) this._kinematic_character_controller.Jump();
        }

        /* Move Player in Direction and Get New Transform */
        const newTransform = this._kinematic_character_controller.Move(direction);

        /* Update Camera and Player Position */
        const newPos = newTransform.getOrigin();
        const newPos3 = new THREE.Vector3(newPos.x(), newPos.y(), newPos.z());
        this.player_mesh.position.copy(newPos3);
        this._camera.position.copy(newPos3);
    }
}

export default PlayerController