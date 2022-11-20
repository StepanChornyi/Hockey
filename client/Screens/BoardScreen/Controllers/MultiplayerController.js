import { Black, Component, Graphics } from "black-engine";

import InputPopup from "../../../InputPopup";
import GameModel from "../../../GameModel";
import { CONNECT, C_MATCH_DATA, C_PLAYER_NAME, C_PLAYER_POS, C_SWITCH_HOST_PLAYER, DISCONNECT, S_HOST_PLAYER_CHANGED, S_GOAL, C_GOAL, S_INIT_MATCH, S_MATCH_DATA, S_OPPONENT_DISCONNECTED, S_OPPONENT_POS, S_PLAYER_NAME, S_START_MATCH, S_GAME_OVER } from "../../../../Protocol";
import { BALL_RADIUS, BOARD_CENTER } from "../Board/BoardConfig";
// import BoardSim from "./Board/BoardSim";

export default class MultiplayerController extends Component {
  constructor(socket, board, boardSim) {
    super();

    this._socket = socket;
    this._board = board;
    this._boardSim = boardSim;

    this.touchable = true;
    this.actAsServer = false;/////////////
    this.lastTimeStamp = -1;
    this.lastData = null;

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

        break;
      case S_GOAL:
        board.showGoal(!!data.goalPlayerIndex, data.goalPlayerIndex !== GameModel.playerIndex);
        board.setAScore(data.scores[0]);
        board.setBScore(data.scores[1]);
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

      // if (data.winPlayerIndex === GameModel.playerIndex) {
      //   setTimeout(() => {
      //     board.showScoreWin()
      //     setTimeout(() => {
      //       this.post('win');
      //     }, 250);
      //   }, 150);
      // } else {
      //   setTimeout(() => {
      //     board.showScoreLose()
      //     setTimeout(() => {
      //       this.post('lose');
      //     }, 250);
      //   }, 150);
      // }
      case S_START_MATCH:
        boardSim.isPaused = false;

        board.setMaxScore(data.maxScore);

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
      if (GameModel.isHost) {
        // board.showGoal(isA);

        this.post('~server', C_GOAL, { matchId: GameModel.matchId, goalPlayerIndex: isA ? 1 : 0 });
      }

      // this.post('~server', C_SWITCH_HOST_PLAYER, { matchId: GameModel.matchId });
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

    if (GameModel.playerIndex) {
      boardSim.playerAController.copyFrom(board.inputA);
    } else {
      boardSim.playerBController.copyFrom(board.inputB);
      // boardSim.playerBController.copyFrom(board.inputB);/////////////
    }

    boardSim.update();

    // board.inputA = boardSim.playerAController;
    // board.inputB = boardSim.playerBController;
  }

  onRender(forcedUpdate = false) {
    const boardSim = this._boardSim;
    const board = this._board;

    this.post('render');

    const data = boardSim.data;

    if (GameModel.isHost) {
      board.showCollisions(data);
    }

    board.setData(data);

    board.setCenterColor(GameModel.isHost)


    if (boardSim.isPaused)
      return;

    if (!GameModel.isHost && !forcedUpdate) {
      if (!GameModel.isHost) {
        const input = GameModel.playerIndex ? board.inputA : board.inputB;

        this.post('~server', C_PLAYER_POS, {
          matchId: GameModel.matchId,
          x: input.x,
          y: input.y,
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

    //   this.on('render', () => {
    //     this.post('~server', C_PLAYER_POS, JSON.stringify(board.inputB))
    //   })
  }
}