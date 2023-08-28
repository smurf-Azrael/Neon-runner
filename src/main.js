import Assets from './utils/Assets.js'
import Loader from './utils/Loader.js'

import Experience from './Experience/Experience';

import '../index.css'

let EXPERIENCE_INSTANCE = null;

(async() => {
    try {
        const loader = new Loader();

        const result = await loader.LoadAll(Object.keys(Assets).map(k => Assets[k]));
        console.log('Finished loading resources.', result);
        console.log(Assets);

        Ammo = await Ammo();
        console.log('Finished loading Ammo JS.');

        EXPERIENCE_INSTANCE = new Experience();
    } catch (err) {
        console.warn(err);
    }
})();