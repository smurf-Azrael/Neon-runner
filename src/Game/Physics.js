class Physics {
    constructor() {
        this.collision_configuration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher(this.collision_configuration);
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collision_configuration);
        this.world.setGravity(new Ammo.btVector3(0, -9.81, 0));
        this.world.getBroadphase().getOverlappingPairCache().setInternalGhostPairCallback(new Ammo.btGhostPairCallback());
    }

    Update(t) {
        this.world.stepSimulation(t, 10);
    }
}

export default Physics
