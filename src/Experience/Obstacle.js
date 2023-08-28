import * as THREE from 'three'
import RigidBody from "./Rigidbody.js"
import Game from './Experience.js';

class Obstacle {
    constructor() {
        this.mesh;
        this.position;
        this.rigid_body;
        this.margin = 0;
        this.size;
    }

    Dispose() {}

    Update() {}
}

class Spinner extends Obstacle {
    constructor(params) {
        super(params);

        this.position = params.position ? params.position : new THREE.Vector3(0, 0, 0);
        this.spin_dir = params.spinDir ?? 1;
        this.size = new THREE.Vector3(15, 0.15, 0.15);
        this.margin = 10;

        this._quaternion_3;
        this._quaternion_bt;

        this.Initialize();
    }

    Initialize() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.mesh.position.set(
            this.position.x,
            this.position.y + this.size.y * 0.5,
            this.position.z
        );

        this._quaternion_3 = this.mesh.quaternion;
        this._quaternion_bt = new Ammo.btQuaternion();

        this.rigid_body = new RigidBody();
        this.rigid_body.CreateBox(0, this.mesh.position, this.mesh.quaternion, this.size);
    }

    Dispose(physics_world, scene) {
        if (!scene) return;
        if (!physics_world) return;

        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();

        Ammo.destroy(this._quaternion_bt);
        physics_world.removeRigidBody(this.rigid_body.body);
        this.rigid_body.Destroy();
    }

    Update(e) {
        this._quaternion_3.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), e * this.spin_dir);
        this._quaternion_bt.setValue(this._quaternion_3.x, this._quaternion_3.y, this._quaternion_3.z, this._quaternion_3.w);

        this.rigid_body.transform.setRotation(this._quaternion_bt);
        this.rigid_body.body.setWorldTransform(this.rigid_body.transform);
        this.rigid_body.motion_state.setWorldTransform(this.rigid_body.transform);

        const new_quaternion = this.rigid_body.transform.getRotation();

        this.mesh.quaternion.set(
            new_quaternion.x(),
            new_quaternion.y(),
            new_quaternion.z(),
            new_quaternion.w()
        );
    }
}

class Test extends Obstacle {
    constructor(params) {
        super(params);

        this.position = params.position ? params.position : new THREE.Vector3(0, 0, 0);
        this.size = new THREE.Vector3(10, 1, 0.1);
        this.margin = 5;
    
        this.Initialize();
    }

    Initialize() {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.mesh.position.set(
            this.position.x,
            this.position.y + this.size.y * 0.5,
            this.position.z
        );

        this.rigid_body = new RigidBody();
        this.rigid_body.CreateBox(0, this.mesh.position, this.mesh.quaternion, this.size);
    }

    Dispose(physics_world, scene) {
        if (!scene) return;
        if (!physics_world) return;

        scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();

        physics_world.removeRigidBody(this.rigid_body.body);
        this.rigid_body.Destroy();
    }

    Update(e) {}
}

class Obstacles {
    constructor({ spacing, size, physics, scene, playerController }) {
        this.list = [];
        this.spacing = spacing ?? 10;
        this.offset = 0;
        this.MAX = size ?? 5;
        this.TYPES = [Spinner, Test];

        if (!physics) {
            console.warn('No physics specified!');
        } this.PHYSICS = physics;

        if (!scene) {
            console.warn('No scene specified!');
        } this.SCENE = scene;

        if (!playerController) {
            console.warn('No playerController specified!');
        } this.PLAYER_CONTROLLER = playerController;

        this.SetupContactPairResultCallback();
    }

    CreateObstacle(params) {
        if (this.IsFull()) return;

        const Obstacle_Type = this.TYPES[Math.floor(Math.random() * this.TYPES.length)];

        const instance = new Obstacle_Type(params);
        this.list.push(instance);

        this.SCENE.add(instance.mesh);
        this.PHYSICS.world.addRigidBody(instance.rigid_body.body);
        
        this.offset++;

        return instance;
    }

    RemoveObstacle(i) {
        if (this.IsEmpty()) return;
        this.list[i].Dispose(this.PHYSICS.world, this.SCENE);
        this.list.splice(i, 1);
    }

    Fill() {
        if (this.IsFull()) return;

        for (let i = this.list.length; i < this.MAX; i++) {
            this.CreateObstacle({
                position: new THREE.Vector3(0, 0, this.offset * this.spacing + 16 + this.offset),
                spinDir: (this.offset % 2 == 0 ? 2 : -2) * Math.random()
            });
        }
    }

    Reset() {
        if (this.IsEmpty()) return;

        this.offset = 0;

        for (let i = 0; i < this.list.length; i++) {
            this.list[i].Dispose(this.PHYSICS.world, this.SCENE);
        }

        this.list.splice(0, this.list.length);
    }

    SetupContactPairResultCallback() {
        this._cb_contact_pair_result = new Ammo.ConcreteContactResultCallback();
        this._cb_contact_pair_result.hasContact = false;
        this._cb_contact_pair_result.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) {
            const contact_point = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);
            
            if (contact_point.getDistance() > 0.05) return;

            this.hasContact = true;
        }
    }

    CheckCollision(body1, body2) {
        this._cb_contact_pair_result.hasContact = false;
        this.PHYSICS.world.contactPairTest(body1, body2, this._cb_contact_pair_result);

        return this._cb_contact_pair_result.hasContact;
    }

    IsEmpty() { return this.list.length === 0; }
    IsFull() { return this.list.length > this.MAX; }

    Update(d, e) {
        const matches = [];
        for (let i = 0; i < this.list.length; i++) {
            // this.list[i].mesh.material.color.setHex(0x00ff00);
            this.list[i].Update(e);

            if (
                this.PLAYER_CONTROLLER &&
                this.PLAYER_CONTROLLER.position.z < this.list[i].mesh.position.z + this.list[i].margin
            ) {
                if (matches.length < 3) matches.push(this.list[i]);
            } else {
                this.CreateObstacle({
                    position: new THREE.Vector3(0, 0, this.offset * this.spacing + 16 + this.offset),
                    spinDir: (this.offset % 2 == 0 ? 2 : -2) * Math.random()
                });
                this.RemoveObstacle(i);
                continue;
            }
        }

        for (let i = 0; i < matches.length; i++) {
            if (this.CheckCollision(this.PLAYER_CONTROLLER.KINEMATIC_CHARACTER_CONTROLLER.body, matches[i].rigid_body.body)) {
                alert('Lose');
                return;
            }
            // matches[i].mesh.material.color.setHex(0xff0000);
        }
    }
}

export default Obstacles