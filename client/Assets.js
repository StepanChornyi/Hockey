import { AssetManager, Black } from 'black-engine';

import bg from 'assets/textures/bg.jpg';

import particleRed from 'assets/textures/red.png';
import particleGreen from 'assets/textures/green.png';
import particleBlue from 'assets/textures/blue.png';

import hitSound from 'assets/audio/hit.mp3';
import hitWallSound from 'assets/audio/hit_wall.mp3';
import goalWinSound from 'assets/audio/goal_win.mp3';
import goalLoseSound from 'assets/audio/goal_lose.mp3';
import winSound from 'assets/audio/win.mp3';
import loseSound from 'assets/audio/lose.mp3';
import transition from 'assets/audio/transition.mp3';
import click from 'assets/audio/click.mp3';

export default function loadAssets(clb) {
  const assets = new AssetManager();

  assets.enqueueImage("bg", bg);

  assets.enqueueImage("particleRed", particleRed);
  assets.enqueueImage("particleGreen", particleGreen);
  assets.enqueueImage("particleBlue", particleBlue);

  assets.enqueueSound("hit", hitSound);
  assets.enqueueSound("hitWall", hitWallSound);
  assets.enqueueSound("goalWin", goalWinSound);
  assets.enqueueSound("goalLose", goalLoseSound);
  assets.enqueueSound("win", winSound);
  assets.enqueueSound("lose", loseSound);
  assets.enqueueSound("transition", transition);
  assets.enqueueSound("click", click);

  assets.on('complete', () => {
    if (document.getElementById("preloaderSpinner")) {
      document.body.removeChild(document.getElementById("preloaderSpinner"));
    }

    Black.engine.viewport.isTransparent = false;

    clb();
  });

  assets.loadQueue();
}