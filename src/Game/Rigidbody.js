class RigidBody {
    constructor() {}

    CreateBox(mass, pos, quat, size) {
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        this.motion_state = new Ammo.btDefaultMotionState(this.transform);

        const bt_size = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
        this.shape = new Ammo.btBoxShape(bt_size);
        this.shape.setMargin(0.05);

        this.inertia = new Ammo.btVector3(0, 0, 0);
        if (mass > 0) this.shape.calculateLocalInertia(mass, this.inertia);

        this.info = new Ammo.btRigidBodyConstructionInfo(mass, this.motion_state, this.shape, this.inertia);
        this.body = new Ammo.btRigidBody(this.info);

        Ammo.destroy(bt_size);
    }

    SetRestitution(amount) { this.body.setRestitution(amount); }
    SetFriction(amount) { this.body.setFriction(amount); }
    SetRollingFriction(amount) { this.body.setRollingFriction(amount); }

    Destroy() {
        Ammo.destroy(this.transform);
        Ammo.destroy(this.motion_state);
        Ammo.destroy(this.shape);
        Ammo.destroy(this.inertia);
        Ammo.destroy(this.info);
        Ammo.destroy(this.body);
    }
}

export default RigidBody