const flags = {
    CF_STATIC_OBJECT: 1,
    CF_KINEMATIC_OBJECT: 2,
    CF_NO_CONTACT_RESPONSE: 4,
    CF_CUSTOM_MATERIAL_CALLBACK: 8,
    CF_CHARACTER_OBJECT: 16
};

const GRAVITY = 25;

class KinematicCharacterController {
    constructor(pos, quat) {
        this.player_speed = 10;

        this.radius = 0.5;
        this.height = 3;

        this.tmp_vec = new Ammo.btVector3();
        this.has_collided = true;

        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        this.transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));

        this.motion_state = new Ammo.btDefaultMotionState(this.transform);

        this.shape = new Ammo.btCapsuleShape(this.radius, this.height);
        this.shape.setMargin(0.05);

        this.body = new Ammo.btPairCachingGhostObject();
        this.body.setWorldTransform(this.transform);
        this.body.setCollisionShape(this.shape);
        this.body.setCollisionFlags(this.body.getCollisionFlags() | -1);
        this.body.activate(true);

        this.controller = new Ammo.btKinematicCharacterController(this.body, this.shape, 0, 1);
        this.controller.setUseGhostSweepTest(true);
        this.controller.setUpInterpolate();
        this.controller.setGravity(GRAVITY);
        // this.controller.setMaxSlope(Math.PI / 2);
        this.controller.canJump(true);
        this.controller.setJumpSpeed(GRAVITY / 3);
        this.controller.setMaxJumpHeight(100);
    }

    Move(direction) {
        this.tmp_vec.setX(direction.x);
        this.tmp_vec.setY(direction.y);
        this.tmp_vec.setZ(direction.z);
        this.controller.setWalkDirection(this.tmp_vec);

        const newTransform = this.body.getWorldTransform();

        return newTransform;
    }

    Jump() { this.controller.jump(); }

    Teleport(pos) {
        const position = new Ammo.btVector3(pos.x, pos.y, pos.z);
        this.transform.setOrigin(position);
        this.body.setWorldTransform(this.transform);
        this.motion_state.setWorldTransform(this.transform);

        Ammo.destroy(position);
    }

    CheckForNewCollisions() {
        const isColliding = this.body.getNumOverlappingObjects() > 0;

        if (isColliding && !this.has_collided) {
            this.has_collided = true;
            return true;
        }

        if (!isColliding && this.has_collided) {
            this.has_collided = false;
            return false;
        }
    }

    GetCollidingObjects() {
        const contacts = this.body.getNumOverlappingObjects();

        if (contacts < 0) return;

        const contactObjects = [];

        for (let i = 0; i < contacts; i++) {
            const contactObject = this.body.getOverlappingObject(i);

            if (!contactObject) continue;

            contactObjects.push(contactObject);
        }

        return contactObjects;
    }
}

export default KinematicCharacterController