import DOMElements from './DOMElements.js'
import Loader from './Game/Loader.js'
import Assets from './Game/Assets.js'
import Game from './Game/Game.js'
import './style.css'

const switch_screen = (screen) => {
    for (const screen in DOMElements.screens) DOMElements.screens[screen].classList.add('hidden');
    screen.classList.remove('hidden');
}

new Loader().LoadAll(Assets.textures, res => {
    console.log(`Finished loading resources.`);

    Ammo().then(lib => {
        Ammo = lib;
        console.log(`Finished loading Ammo JS.`);
        // switch_screen(DOMElements.screens.mainScreen);
        switch_screen(DOMElements.screens.gameScreen); // DEV
        new Game() // DEV
    }).catch(console.error);
})

// let GAME;
// DOMElements.buttons.playButton.addEventListener('click', () => {
//     if (!GAME) GAME = new Game();
//     else console.log('Restart game');

//     switch_screen(DOMElements.screens.gameScreen);
// });