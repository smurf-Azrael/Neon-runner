import * as THREE from 'three'
import { Line, Vector3 } from 'three';

import RigidBody from './Rigidbody.js';

const VERTEX_SHADER = `
varying vec3 v_pos;
void main() {
    v_pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
varying vec3 v_pos;

uniform vec3 u_size;
uniform vec3 u_color;
uniform float u_thickness;
uniform float u_smoothness;
uniform float u_time;

void main() {
    float a = smoothstep(u_thickness, u_thickness + u_smoothness, length(abs(v_pos.xy) - u_size.xy));
    a *= smoothstep(u_thickness, u_thickness + u_smoothness, length(abs(v_pos.yz) - u_size.yz));
    a *= smoothstep(u_thickness, u_thickness + u_smoothness, length(abs(v_pos.xz) - u_size.xz));

    vec3 color = mix(u_color, vec3(0.0), a);

    gl_FragColor = vec4(color, 1.0);
}
`;

const BLUE_COLOR = new THREE.Color(0x11FFEE);
const PINK_COLOR = new THREE.Color(0xFF10F0);

class World {
    constructor(physics, scene) {
        if (!physics) {
            console.warn('No physics specified!'); return;
        }
        this._physics = physics;

        if (!scene) {
            console.warn('No scene specified!'); return;
        }
        this._scene = scene;

        this.CreatePlatforms();
        this.CreateBoxes();
        this.CreateLasers();
        this.CreateDummyObstacles();
    }

    CreateStaticBody(size, pos = new THREE.Vector3(), quat = new THREE.Quaternion(), uniforms) {
        if (!size) {
            console.warn('No size specified!'); return;
        }

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size.x, size.y, size.z),
            new THREE.ShaderMaterial({
                vertexShader: VERTEX_SHADER,
                fragmentShader: FRAGMENT_SHADER,
                uniforms: uniforms === undefined ? {
                    u_size: { value: size.clone().multiplyScalar(0.5) },
                    u_color: { value: new THREE.Color(0x00ccff) },
                    // u_color: { value: BLUE_COLOR },
                    u_thickness: { value: 0.1 },
                    u_smoothness: { value: 0.01 }
                } : uniforms,
                side: THREE.FrontSide
            })
        );
        mesh.position.copy(pos);
        mesh.quaternion.copy(quat);
        this._scene.add(mesh);

        const rigid_body = new RigidBody()
        rigid_body.CreateBox(0, pos, quat, size);
        this._physics.world.addRigidBody(rigid_body.body, 1, -1);
        rigid_body.body.needUpdate = true;

        return { mesh, rigid_body };
    }

    CreatePlatforms() {
        const spawn_platform = this.CreateStaticBody(new THREE.Vector3(10, 2, 10), new THREE.Vector3(0, -1, 0));
        const spawn_platform_left_wall = this.CreateStaticBody(new THREE.Vector3(0.1, 10, 10), new THREE.Vector3(5, 4.9, 0));
        const spawn_platform_right_wall = this.CreateStaticBody(new THREE.Vector3(0.1, 10, 10), new THREE.Vector3(-5, 4.9, 0));
        const spawn_platform_back_wall = this.CreateStaticBody(new THREE.Vector3(10, 10, 0.1), new THREE.Vector3(0, 4.9, -5));
        const spawn_platform_top_wall = this.CreateStaticBody(new THREE.Vector3(10, 0.1, 10), new THREE.Vector3(0, 9.9, 0));

        // const platform = this.CreateStaticBody(new THREE.Vector3(5, 10, 1000), new THREE.Vector3(0, -5, 504.9));
        for (let i = 0; i < 100; i++) {
            const platform = this.CreateStaticBody(new THREE.Vector3(5, 2, 20), new THREE.Vector3(0, -1, i * 20 + 15.1 + i));
            if (i % 2 == 0) platform.mesh.material.uniforms.u_color.value = PINK_COLOR;
        }
        // const left_wall = this.CreateStaticBody(new THREE.Vector3(0.1, 100, 200), new THREE.Vector3(50, 0, 54.9));
        // const right_wall = this.CreateStaticBody(new THREE.Vector3(0.1, 100, 200), new THREE.Vector3(-50, 0, 54.9));
        // const bottom_wall = this.CreateStaticBody(new THREE.Vector3(102, 0.1, 200), new THREE.Vector3(0, -50, 54.9));
        // const top_wall = this.CreateStaticBody(new THREE.Vector3(102, 0.1, 200), new THREE.Vector3(0, 50, 54.9));

        // left_wall.mesh.material.uniforms.u_thickness.value = 1;
        // right_wall.mesh.material.uniforms.u_thickness.value = 1;
        // bottom_wall.mesh.material.uniforms.u_thickness.value = 1;
        // top_wall.mesh.material.uniforms.u_thickness.value = 1;
    }

    CreateBoxes() {
        this._boxes = Array(1000).fill(null).map((e, i) => {
            const v = new Vector3(
                (Math.random() * 2 - 1) * 30,
                Math.random() * 50 - 12.75,
                (Math.random() * 2 - 1) * 500 + 500
            );

            if (v.x < 0) v.x -= 10;
            if (v.x > 0) v.x += 10;

            let scale = Math.pow(Math.random(), 2.0) * 0.5 + 0.05
            scale *= 3;

            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(scale, scale, scale),
                new THREE.MeshBasicMaterial({ color: i % 2 == 0 ? BLUE_COLOR : PINK_COLOR })
            );
            mesh.position.copy(v);

            const x_rotation_speed = Math.random();
            const y_rotation_speed = Math.random();

            this._scene.add(mesh);

            return { mesh, rotation: { x_rotation_speed, y_rotation_speed } };
        })
    }

    CreateLasers() {
        this._rotation = 0;
        
        this._lasers = Array(1000).fill(null).map((e, i) => {
            const points = [
                new THREE.Vector3(-50, -50, i * 25),
                new THREE.Vector3(0, 50, i * 25),
                new THREE.Vector3(50, -50, i * 25)
            ];

            const mesh = new Line(
                new THREE.BufferGeometry().setFromPoints(points),
                new THREE.LineBasicMaterial({ color: i % 2 == 0 ? BLUE_COLOR : PINK_COLOR })
            );
            mesh.rotation.z = this._rotation;

            this._scene.add(mesh);

            this._rotation += 1;
        });
    }

    CreateDummyObstacles() {
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
    }

    Update(t) {
        this.rb_box.motion_state.getWorldTransform(this.tmp_transform);
        const pos = this.tmp_transform.getOrigin();
        const quat = this.tmp_transform.getRotation();
        const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
        const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

        this.box.position.copy(pos3);
        this.box.quaternion.copy(quat3);

        for (let i = 0; i < this._boxes.length; i++) {
            this._boxes[i].mesh.rotation.x += t * this._boxes[i].rotation.x_rotation_speed * 0.25;
            this._boxes[i].mesh.rotation.y += t * this._boxes[i].rotation.y_rotation_speed * 0.25;
        }
    }
}

export default World