import { Black, Component, Graphics } from "black-engine";

import InputPopup from "../../../InputPopup";
import GameModel from "../../../GameModel";
import { BALL_RADIUS, BOARD_CENTER, PLAYER_A_BOX } from "../Board/BoardConfig";
import AbstractMatchController from "./AbstractMatchControler";
import { S_START_MATCH } from "../../../../Protocol";
// import BoardSim from "./Board/BoardSim";

export default class LocalBotMatchController extends AbstractMatchController {
  constructor(board, boardSim) {
    super(board, boardSim);

    this._botHit = false;
    this._botMoveInertia = 0;
    this._isPrevToDefault = false;

    this._yourScore = 0;
    this._botScore = 0;
    this._maxScore = 3;

    this._init();
  }

  processMessage(msg) {
    if (msg === S_START_MATCH) {
      GameModel.playerIndex = 0;

      this._board.setMaxScore(this._maxScore);
      this._boardSim.isPaused = false;
    }
  }

  _init() {
    const boardSim = this._boardSim;
    const board = this._board;

    boardSim.on('goal', (_, isA) => {
      if (!this.gameObject)
        return;

      board.showGoal(isA, !isA);

      if (isA) {
        this._yourScore++;
      } else {
        this._botScore++;
      }

      board.setAScore(this._botScore);
      board.setBScore(this._yourScore);

      let isGameOver = false;
      let isWinner = false;

      if (this._yourScore >= this._maxScore) {
        isGameOver = true;
        isWinner = true;
      } else if (this._botScore >= this._maxScore) {
        isGameOver = true;
        isWinner = false;
      }

      if (isGameOver) {
        boardSim.isPaused = true;

        setTimeout(() => {
          isWinner ? board.showScoreWin() : board.showScoreLose();
          setTimeout(() => {
            this.post(isWinner ? 'win' : 'lose');
          }, 250);
        }, 150);
      }
    })

    // board.inputA = boardSim.playerA.position;
    board.inputB = boardSim.playerB.position;

    board.initAsPlayerB()

    boardSim.isPaused = true;/////////////

    this.onRender(true);
  }

  onUpdate() {
    const boardSim = this._boardSim;
    const board = this._board;

    if (boardSim.isPaused)
      return;

    // BOT CONTROL LOGIC
    boardSim.playerAController.copyFrom(board.inputA);

    boardSim.playerBController.copyFrom(board.inputB);
    // boardSim.playerBController.copyFrom(board.inputB);/////////////

    boardSim.update();
  }

  onRender(forcedUpdate = false) {
    const boardSim = this._boardSim;
    const board = this._board;

    this.post('render');

    const data = boardSim.data;

    board.showCollisions(data);

    board.setData(data);

    if (!boardSim.isPaused)
      this._updateBot(data);
  }


  _updateBot(data) {
    const currPos = data.playerA;
    const ballPos = data.ball;

    if (!PLAYER_A_BOX.containsXY(ballPos.x, ballPos.y)) {
      this._botHit = false;

      if (!this._isPrevToDefault) {
        this._botMoveInertia = 0;
      }

      this._isPrevToDefault = true;

      return this._moveTo(currPos, defaultPos, 0.08);
    }

    if (data.collisionData.length) {
      const { bodyA, bodyB } = data.collisionData[0];

      if (bodyA.id === data.playerA.id || bodyB.id === data.playerA.id) {
        this._botHit = true;
      }
    }

    if (this._botHit) {
      if (!this._isPrevToDefault) {
        this._botMoveInertia = 0;
      }

      this._isPrevToDefault = true;

      return this._moveTo(currPos, defaultPos, 0.08);
    }

    const txBoost = Math.abs(Math.sin(Black.time.now * 5)) * 0.05;
    const tyBoost = Math.abs(Math.cos(Black.time.now * 1)) * 0.1;

    const offsetX = Math.sin(Black.time.now * 8) * 20;
    const offsetY = Math.cos(Black.time.now * 13) * 20;

    if (this._isPrevToDefault) {
      this._botMoveInertia = 0;
    }

    this._isPrevToDefault = false;

    return this._moveTo(currPos, {
      x: ballPos.x + offsetX,
      y: ballPos.y + offsetY,
    }, 0.18 + txBoost, 0.05 + tyBoost);
  }

  _moveTo(currPos, newPos, tx, ty = tx) {
    this._board.inputA = {
      x: lerp(currPos.x, newPos.x, tx * this._botMoveInertia),
      y: lerp(currPos.y, newPos.y, ty * this._botMoveInertia),
    };

    this._botMoveInertia = lerp(this._botMoveInertia, 1, 0.1);
  }
}

const defaultPos = {
  x: PLAYER_A_BOX.center().x,
  y: PLAYER_A_BOX.top + PLAYER_A_BOX.height * 0.05,
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}