import * as THREE from 'three'
import RigidBody from "./Rigidbody.js"

class Obstacle {
    constructor() {}

    CreateSpinner(position, spin_dir=1) {
        this.spin_dir = spin_dir;

        const size = new THREE.Vector3(15, 0.1, 0.1);

        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y ,size.z),
            new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        this.mesh.position.set(position.x, position.y + size.y / 2, position.z);

        this._quaternion3 = this.mesh.quaternion;
        this._quaternionBT = new Ammo.btQuaternion();

        this.rigid_body = new RigidBody();
        this.rigid_body.CreateBox(0, this.mesh.position, this.mesh.quaternion, size);

        return { mesh: this.mesh, rigid_body: this.rigid_body };
    }

    Update(e) {
        this._quaternion3.setFromAxisAngle(new THREE.Vector3(0, 1, 0).normalize(), e * this.spin_dir);
        this._quaternionBT.setValue(this._quaternion3.x, this._quaternion3.y, this._quaternion3.z, this._quaternion3.w);

        this.rigid_body.transform.setRotation(this._quaternionBT);
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

export default Obstacle