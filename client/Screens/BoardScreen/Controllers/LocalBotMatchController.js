import { Black, Component, Graphics } from "black-engine";

import InputPopup from "../../../InputPopup";
import GameModel from "../../../GameModel";
import { BALL_A_RESET, BALL_B_RESET, BALL_RADIUS, BOARD_CENTER, GATES_SIZE, PLAYER_A_BOX, PLAYER_A_START, PLAYER_B_BOX, PLAYER_B_START, PLAYER_RADIUS } from "../Board/BoardConfig";
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
    this._maxScore = 10;

    this._init();
  }

  processMessage(msg) {
    if (msg === S_START_MATCH) {
      GameModel.playerIndex = 0;

      this._board.setMaxScore(this._maxScore);
      this._board.resetScores();

      this._boardSim.isPaused = false;
      this._boardSim.resetBall();

      this.sensitivity = 0;
      this.resetVal = 0;
      this.freeze = 1;

      this._yourScore = 0;
      this._botScore = 0;

      setTimeout(() => {
        this.changeFreezeValue(0, 0.2)
        this.changeSensitivityValue(1, 0.2, 0)
      }, 4000);
    }
  }

  _init() {
    const boardSim = this._boardSim;
    const board = this._board;

    boardSim.on('goal', (_, isA) => this._onGoal(isA));

    // board.inputA = boardSim.playerA.position;
    board.inputB = boardSim.playerB.position;

    board.initAsPlayerB()

    boardSim.isPaused = true;/////////////

    this.onRender(true);
  }

  _onGoal(isA) {
    const boardSim = this._boardSim;
    const board = this._board;

    if (!this.gameObject)
      return;

    board.showGoal(isA);

    if (isA) {
      this._yourScore++;
    } else {
      this._botScore++;
    }

    board.setAScore(this._botScore);
    board.setBScore(this._yourScore);

    const { isGameOver, youWin } = this._checkGameOver();

    !isGameOver && setTimeout(() => {
      boardSim.resetBall(isA ? BALL_A_RESET : BALL_B_RESET);

      board.animateBall().once("ready", () => {
        this.changeSensitivityValue(1, 0.2)
        this.changeResetValue(0, 0.2)
      });
    }, 1000);

    this.changeSensitivityValue(0, 0.9)
    this.changeResetValue(1, 0.9, 0)

    if (isGameOver) {
      boardSim.isPaused = true;

      setTimeout(() => {
        youWin ? board.showScoreWin() : board.showScoreLose();
        setTimeout(() => {
          this.post(youWin ? 'win' : 'lose');
        }, 500);
      }, 350);
    }
  }

  _checkGameOver() {
    let isGameOver = false;
    let youWin = false;

    if (this._yourScore >= this._maxScore) {
      isGameOver = true;
      youWin = true;
    } else if (this._botScore >= this._maxScore) {
      isGameOver = true;
      youWin = false;
    }

    return { isGameOver, youWin };
  }

  onUpdate() {
    const boardSim = this._boardSim;
    const board = this._board;

    if (boardSim.isPaused)
      return;

    let sensitivity = this.sensitivity;
    let resetVal = this.resetVal;

    if (this.freeze > 0) {

      const freezeRadius = PLAYER_RADIUS * 0.5;

      const inputB = board.inputB;
      const distB = PLAYER_B_START.distance(inputB);
      const offset = inputB.clone()
        .subtract(PLAYER_B_START)
        .multiplyScalar(distB === 0 ? 0 : 1 / distB);

      offset.multiplyScalar(Math.min(freezeRadius, distB));
      offset.add(PLAYER_B_START);

      lerpVec2(boardSim.playerBController, offset, 0.2);

      sensitivity *= (1 - this.freeze);
      resetVal *= (1 - this.freeze);
    }

    lerpVec2(boardSim.playerAController, board.inputA, sensitivity);
    lerpVec2(boardSim.playerBController, board.inputB, sensitivity);

    if (resetVal > 0) {
      boardSim.playerBController.y = Math.min(Math.max(boardSim.playerBController.y, PLAYER_B_BOX.top), PLAYER_B_BOX.bottom)

      const minDist = GATES_SIZE * 0.5 + BALL_RADIUS * 2 + PLAYER_RADIUS;
      const dist = BOARD_CENTER.distance(boardSim.playerBController);

      if (dist < minDist) {
        const normal = boardSim.playerBController.clone().subtract(BOARD_CENTER).multiplyScalar(1 / dist);
        const desiredPos = BOARD_CENTER.clone().add(normal.multiplyScalar(minDist));

        lerpVec2(boardSim.playerBController, desiredPos, resetVal);
      }
    }

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

      return this._moveBotTo(currPos, defaultPos, 0.08);
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

      return this._moveBotTo(currPos, defaultPos, 0.08);
    }

    const txBoost = Math.abs(Math.sin(Black.time.now * 5)) * 0.05;
    const tyBoost = Math.abs(Math.cos(Black.time.now * 1)) * 0.1;

    const offsetX = Math.sin(Black.time.now * 8) * 20;
    const offsetY = Math.cos(Black.time.now * 13) * 20;

    if (this._isPrevToDefault) {
      this._botMoveInertia = 0;
    }

    this._isPrevToDefault = false;

    return this._moveBotTo(currPos, {
      x: ballPos.x + offsetX,
      y: ballPos.y + offsetY,
    }, 0.18 + txBoost, 0.05 + tyBoost);
  }

  _moveBotTo(currPos, newPos, tx, ty = tx) {
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

function lerpVec2(a, b, tx, ty = tx, out = a) {
  out.x = lerp(a.x, b.x, tx);
  out.y = lerp(a.y, b.y, ty);

  return out;
}
