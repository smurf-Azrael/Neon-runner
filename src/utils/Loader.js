import * as THREE from 'three';

// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

class Loader {
    static instance;

    constructor() {
        if (Loader.instance) return Loader.instance;

        Loader.instance = this;

        this._supported_ext_types = ['.fbx', '.gltf', '.glb', '.png', 'jpg', 'jpeg'];
    }

    Load(path) {
        return new Promise((res, rej) => {
            if (!path || path.trim() == '')
                rej('No path or invalid path specified!');

            const ext = path.match(/\.[a-z]+$/)[0];

            if (this._supported_ext_types.findIndex(t => t == ext) < 0)
                rej('Invalid or unsupported file type!');
        
            let loader = null;

            if (ext == '.fbx') {
                loader = new FBXLoader();
                loader.load(path, res, undefined, rej);
            }

            if (/\.png|\.jpg|\.jpeg/.test(ext)) {
                loader = new THREE.TextureLoader();
                loader.load(path, res, undefined, rej);
            }
        });
    }

    LoadAll(items) {
        if (!Array.isArray(items)) {
            console.error('Items list must be of type Array!');
            return;
        }
        
        return Promise.all(items.map(item => this.Load(item.path).then(res => item.data = res)));
    }
}

export default Loader