import Assets from './Game/Assets.js'
import DOMElements from './DOMElements.js'
import Game from './Game/Game.js'
import Loader from './Game/Loader.js'
import './style.css'


let GAME;

new Loader().LoadAll(Assets.textures, res => {
    console.log(`Finished loading resources.`);

    Ammo()
        .then(lib => {
            Ammo = lib;
            console.log(`Finished loading Ammo JS.`);

            DOMElements.screens.loadingScreen.classList.add('hidden');
            DOMElements.screens.mainScreen.classList.remove('hidden');

            // DOMElements.screens.gameScreen.classList.remove('hidden'); // DEV
            // GAME = new Game(); GAME.InitializePlayerControls(); // DEV
        })
        .catch(console.error);
})

DOMElements.buttons.playButton.addEventListener('click', () => {
    DOMElements.screens.mainScreen.classList.add('hidden');
    DOMElements.screens.gameScreen.classList.remove('hidden');
    DOMElements.screens.gameStartScreen.classList.remove('hidden');
    DOMElements.screens.gameOverScreen.classList.add('hidden');

    if (!GAME) {
        GAME = new Game();
        GAME.InitializePlayerControls();
    }
    else GAME.Restart();
});

DOMElements.screens.gameStartScreen.addEventListener('click', () => {
    DOMElements.screens.gameStartScreen.classList.add('hidden');
});

DOMElements.buttons.retryButton.addEventListener('click', () => {
    if (!GAME) return;

    DOMElements.screens.gameOverScreen.classList.add('hidden');
    DOMElements.screens.gameStartScreen.classList.remove('hidden');
    
    GAME.Restart();
});

DOMElements.buttons.exitButton.addEventListener('click', () => {
    DOMElements.screens.gameScreen.classList.add('hidden');
    DOMElements.screens.mainScreen.classList.remove('hidden');
});