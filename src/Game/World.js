import * as THREE from 'three'
import { Line, Vector3 } from 'three';

import Game from './Game.js';
import RigidBody from './Rigidbody.js';
import Obstacles from './Obstacle.js';

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
    constructor(physics, scene, playerController) {
        if (!physics) {
            console.warn('No physics specified!'); return;
        }
        this._physics = physics;

        if (!scene) {
            console.warn('No scene specified!'); return;
        }
        this._scene = scene;

        if (!playerController) {
            console.warn('No player controller specified!'); return;
        }
        this._player_controller = playerController;

        this._max_platforms = 10;
        this._max_boxes = 100;
        this._max_triangles = 50;
        this._max_obstacles = 50;

        this._triangle_offset = 0;

        this.CreatePlatforms();
        this.CreateBoxes();
        this.CreateTriangles();
        this.CreateObstacles();
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

        return { mesh, rigid_body };
    }

    CreatePlatforms() {
        const spawn_platform = this.CreateStaticBody(new THREE.Vector3(10, 0.1, 10), new THREE.Vector3(0, -0.05, 0));
        const spawn_platform_left_wall = this.CreateStaticBody(new THREE.Vector3(0.1, 10, 10), new THREE.Vector3(5, 4.9, 0));
        const spawn_platform_right_wall = this.CreateStaticBody(new THREE.Vector3(0.1, 10, 10), new THREE.Vector3(-5, 4.9, 0));
        const spawn_platform_back_wall = this.CreateStaticBody(new THREE.Vector3(10, 10, 0.1), new THREE.Vector3(0, 4.9, -5));
        const spawn_platform_top_wall = this.CreateStaticBody(new THREE.Vector3(10, 0.1, 10), new THREE.Vector3(0, 9.9, 0));

        this._platforms = Array(this._max_platforms).fill().map((e, i) => {
            const platform = this.CreateStaticBody(new THREE.Vector3(5, 2, 20), new THREE.Vector3(0, -1, (i * 20) + 16 + i));
            if (i % 2 == 1) platform.mesh.material.uniforms.u_color.value = PINK_COLOR;
        });
    }

    CreateBoxes() {
        this._boxes = Array(this._max_boxes).fill().map((e, i) => {
            const v = new Vector3(
                (Math.random() * 2 - 1) * 30,
                Math.random() * 50 - 12.75,
                (Math.random() * 2 - 1) * 100 + 100
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

    CreateTriangles() {
        this._rotation = 0;
        this._triangle_offset = 0;
        
        this._triangles = Array(this._max_triangles).fill().map((e, i) => {
            const points = [
                new THREE.Vector3(-50, -50, i * 25).multiplyScalar(1),
                new THREE.Vector3(0, 50, i * 25).multiplyScalar(1),
                new THREE.Vector3(50, -50, i * 25)
            ];

            const mesh = new Line(
                new THREE.BufferGeometry().setFromPoints(points),
                new THREE.LineBasicMaterial({ color: i % 2 == 0 ? BLUE_COLOR : PINK_COLOR })
            );
            mesh.rotation.z = this._rotation;

            this._scene.add(mesh);

            this._rotation++;
            this._triangle_offset++;

            return mesh;
        });
    }

    CreateObstacles() {
        this._obstacles = new Obstacles({ size: 25, physics: this._physics, scene: this._scene, playerController: this._player_controller });
        this._obstacles.Reset();
        this._obstacles.Fill();
    }

    CreateNewTriangle() {
        const points = [
            new THREE.Vector3(-50, -50, this._triangle_offset * 25).multiplyScalar(1),
            new THREE.Vector3(0, 50, this._triangle_offset * 25).multiplyScalar(1),
            new THREE.Vector3(50, -50, this._triangle_offset * 25)
        ];

        const mesh = new Line(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: this._triangle_offset % 2 == 0 ? BLUE_COLOR : PINK_COLOR })
        );
        mesh.rotation.z = this._rotation;

        this._scene.add(mesh);

        this._rotation++;
        this._triangle_offset++;

        this._triangles.push(mesh);
    }

    RemoveTriangle(index) {
        this._triangles[index].geometry.dispose();
        this._triangles[index].material.dispose();
        this._scene.remove(this._triangles[index]);
        this._triangles.splice(index, 1);
    }

    RemoveAllTriangles() {
        for (let i = 0; i < this._triangles.length; i++) {
            this._scene.remove(this._triangles[i]);
            this._triangles[i].geometry.dispose();
            this._triangles[i].material.dispose();
        }

        this._triangles.splice(0, this._triangles.length);
    }

    Update(t, e) {
        /* Rotate boxes */
        for (let i = 0; i < this._boxes.length; i++) {
            this._boxes[i].mesh.rotation.x += t * this._boxes[i].rotation.x_rotation_speed * 0.25;
            this._boxes[i].mesh.rotation.y += t * this._boxes[i].rotation.y_rotation_speed * 0.25;
        }

        this._obstacles.Update(t, e);

        /* Procedurally generate triangles */
        for (let i = 0; i < this._triangles.length; i++) {
            if (
                this._player_controller &&
                this._player_controller.position.z > this._triangles[i].geometry.attributes.position.array[2] + 10
            ) {
                this.CreateNewTriangle();
                this.RemoveTriangle(i);
            }
        }
    }
}

export default World