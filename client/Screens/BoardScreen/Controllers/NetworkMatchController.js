import { Black, Component, Graphics, Vector } from "black-engine";

import InputPopup from "../../../InputPopup";
import GameModel from "../../../GameModel";
import { CONNECT, C_MATCH_DATA, C_PLAYER_NAME, C_PLAYER_POS, C_SWITCH_HOST_PLAYER, DISCONNECT, S_HOST_PLAYER_CHANGED, S_GOAL, C_GOAL, S_INIT_MATCH, S_MATCH_DATA, S_OPPONENT_DISCONNECTED, S_OPPONENT_POS, S_PLAYER_NAME, S_START_MATCH, S_GAME_OVER } from "../../../../Protocol";
import { BALL_A_RESET, BALL_B_RESET, BALL_RADIUS, BOARD_CENTER, PLAYER_A_START, PLAYER_B_START, PLAYER_RADIUS } from "../Board/BoardConfig";
import AbstractMatchController from "./AbstractMatchControler";
// import BoardSim from "./Board/BoardSim";

export default class NetworkMatchController extends AbstractMatchController {
  constructor(board, boardSim) {
    super(board, boardSim);

    this.actAsServer = false;/////////////
    this.lastTimeStamp = -1;
    this.lastData = null;
    this.prevInput = new Vector();

    this._init();
  }

  processMessage(msg, data) {
    const boardSim = this._boardSim;
    const board = this._board;

    switch (msg) {
      // case S_OPPONENT_DISCONNECTED:
      //   this._boardSim.isPaused = true;
      //   InputPopup.showOpponentDisconnected();
      //   break;
      // case DISCONNECT:
      //   InputPopup.showConnectionLost();
      //   break;

      case S_HOST_PLAYER_CHANGED:
        GameModel.hostPlayerIndex = data.hostPlayerIndex;
        break;
      case S_OPPONENT_POS:
        if (GameModel.playerIndex) {
          board.inputB = data;
          boardSim.playerBController.copyFrom(data);
        } else {
          board.inputA = data;
          boardSim.playerAController.copyFrom(data);
        }
        break;
      case S_INIT_MATCH:
        GameModel.playerIndex = data.playerIndex;

        if (GameModel.playerIndex) {
          board.initAsPlayerA()
        } else {
          board.initAsPlayerB()
        }

        board.setMaxScore(data.maxScore);

        this.sensitivity = 0;
        this.resetVal = 0;
        this.freeze = 1;

        break;
      case S_GOAL:
        board.showGoal(!!data.goalPlayerIndex, data.goalPlayerIndex !== GameModel.playerIndex);
        board.setAScore(data.scores[0]);
        board.setBScore(data.scores[1]);

        if (!data.isGameOver)
          setTimeout(() => {
            if (GameModel.isHost) {
              boardSim.resetBall(!!data.goalPlayerIndex ? BALL_A_RESET : BALL_B_RESET);
            }

            board.animateBall().once("ready", () => {
              // if (isA) {
              //   this._lowerResetValA()
              //   this._raiseSensitivityA();
              // } else {
              //   this._lowerResetValB();
              //   this._raiseSensitivityB();
              // }
            });
          }, 1000);

        break;
      case S_GAME_OVER:
        boardSim.isPaused = true;

        const isWinner = data.winPlayerIndex === GameModel.playerIndex;

        setTimeout(() => {
          isWinner ? board.showScoreWin() : board.showScoreLose();
          setTimeout(() => {
            this.post(isWinner ? 'win' : 'lose');
          }, 250);
        }, 150);
      case S_START_MATCH:
        boardSim.isPaused = false;

        setTimeout(() => {
          this.changeFreezeValue(0, 0.2);
          this.changeSensitivityValue(1, 0.2, 0);
        }, 4000);

        // if (GameModel.playerIndex === 0) {
        //   this.actAsServer = true;
        // } else {
        //   this.actAsServer = false;
        // }
        break;
      case S_MATCH_DATA:
        if (GameModel.isHost)
          break;

        if (this.lastTimeStamp > data.timeStamp)
          return;

        this.lastTimeStamp = data.timeStamp

        // board.inputA = data.playerAController;
        // boardSim.playerAController.copyFrom(board.inputA);

        board.showCollisions(data);

        boardSim.data = data;

        this.lastData = data;
        break;
    }
  }

  _init() {
    const boardSim = this._boardSim;
    const board = this._board;

    // this._initSocket();

    boardSim.on('goal', (_, isA) => {
      if (!this.gameObject)
        return;

      if (GameModel.isHost) {
        // board.showGoal(isA);

        this.post('~server', C_GOAL, { matchId: GameModel.matchId, goalPlayerIndex: isA ? 1 : 0 });
      }
    })

    board.inputA = boardSim.playerA.position;
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


    let sensitivity = this.sensitivity;
    let resetValB = this.resetValB;

    if (this.freeze > 0) {

      const input = GameModel.playerIndex ? board.inputA : board.inputB;
      const startPos = GameModel.playerIndex ? PLAYER_A_START : PLAYER_B_START;
      const controller = GameModel.playerIndex ? boardSim.playerAController : boardSim.playerBController;

      const freezeRadius = PLAYER_RADIUS * 0.5;

      const dist = startPos.distance(input);
      const offset = input.clone()
        .subtract(startPos)
        .multiplyScalar(dist === 0 ? 0 : 1 / dist);

      offset.multiplyScalar(Math.min(freezeRadius, dist));
      offset.add(startPos);

      lerpVec2(controller, offset, 0.2);

      sensitivity *= (1 - this.freeze);
    }

    if (GameModel.playerIndex) {
      lerpVec2(boardSim.playerAController, board.inputA, sensitivity);
    } else {
      lerpVec2(boardSim.playerBController, board.inputB, sensitivity);
    }

    // lerpVec2(boardSim.playerAController, board.inputA, sensitivityA);
    // lerpVec2(boardSim.playerBController, board.inputB, sensitivityB);

    // if (resetValB > 0) {
    //   boardSim.playerBController.y = Math.min(Math.max(boardSim.playerBController.y, PLAYER_B_BOX.top), PLAYER_B_BOX.bottom)

    //   const minDist = GATES_SIZE * 0.5 + BALL_RADIUS * 2 + PLAYER_RADIUS;
    //   const dist = BOARD_CENTER.distance(boardSim.playerBController);

    //   if (dist < minDist) {
    //     const normal = boardSim.playerBController.clone().subtract(BOARD_CENTER).multiplyScalar(1 / dist);
    //     const desiredPos = BOARD_CENTER.clone().add(normal.multiplyScalar(minDist));

    //     lerpVec2(boardSim.playerBController, desiredPos, resetValB);
    //   }
    // }

    boardSim.update();
  }

  _getSensitivity() {
    const boardSim = this._boardSim;
    const board = this._board;

    let sensitivity = this.sensitivity;
    let resetValB = this.resetValB;
    let offset = new Vector();

    const input = GameModel.playerIndex ? board.inputA : board.inputB;

    offset.copyFrom(input)

    if (this.freeze > 0) {

      const startPos = GameModel.playerIndex ? PLAYER_A_START : PLAYER_B_START;
      const controller = GameModel.playerIndex ? boardSim.playerAController : boardSim.playerBController;

      const freezeRadius = PLAYER_RADIUS * 0.5;

      const dist = startPos.distance(input);
      offset.subtract(startPos)
        .multiplyScalar(dist === 0 ? 0 : 1 / dist);

      offset.multiplyScalar(Math.min(freezeRadius, dist));
      offset.add(startPos);

      sensitivity *= (1 - this.freeze);
      // resetValB *= (1 - this.freeze);
    }

    return { sensitivity, offset };
  }

  onRender(forcedUpdate = false) {
    const boardSim = this._boardSim;
    const board = this._board;

    const data = boardSim.data;

    if (GameModel.isHost) {
      board.showCollisions(data);
    }

    board.setData(data);

    board.setCenterColor(GameModel.isHost) ///for debug purposes

    if (boardSim.isPaused)
      return;

    if (!GameModel.isHost && !forcedUpdate) {
      if (!GameModel.isHost) {
        const { offset } = this._getSensitivity();

        const controller = GameModel.playerIndex ? boardSim.playerAController : boardSim.playerBController;


        lerpVec2(controller, offset, this.freeze > 0 ? 0.2 : 1);

        // lerpVec2(this.prevInput, input, GameModel.playerIndex ? sensitivityA : sensitivityB);

        this.post('~server', C_PLAYER_POS, {
          matchId: GameModel.matchId,
          x: controller.x,
          y: controller.y,
        })
      }

      return;
    }

    data.matchId = GameModel.matchId;

    this.post('~server', C_MATCH_DATA, data)

    const sign = GameModel.playerIndex ? 1 : -1;

    if ((BOARD_CENTER.y - boardSim.ball.y - BALL_RADIUS) * sign < 0) {
      this.post('~server', C_SWITCH_HOST_PLAYER, { matchId: GameModel.matchId, playerIndex: GameModel.playerIndex });
    }
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec2(a, b, tx, ty = tx, out = a) {
  out.x = lerp(a.x, b.x, tx);
  out.y = lerp(a.y, b.y, ty);

  return out;
}