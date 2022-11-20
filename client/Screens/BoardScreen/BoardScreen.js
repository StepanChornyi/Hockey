import { Black, CapsStyle, Graphics } from "black-engine";
import AbstractScreen from "../AbstractScreen";
// import BoardOld from "./Board/BoardOld";

import InputPopup from "../../InputPopup";
import GameModel from "../../GameModel";
import Board from "./Board/Board";
import BoardSim from "./Board/BoardSim";
import { CONNECT, C_MATCH_DATA, C_PLAYER_NAME, C_PLAYER_POS, DISCONNECT, S_INIT_AS_A, S_INIT_AS_B, S_MATCH_DATA, S_OPPONENT_DISCONNECTED, S_OPPONENT_POS, S_PLAYER_NAME } from "../../../Protocol";
import MultiplayerController from "./Controllers/MultiplayerController";
import StaticGameController from "./Controllers/StaticGameController";
import GameResultScene from "./GameResultScene/GameResultScene";
import CountdownScene from "./CountdownScene/CountdownScene";
// import BoardSim from "./Board/BoardSim";

export default class BoardScreen extends AbstractScreen {
  constructor(socket, dispatchMessage) {
    super(socket, dispatchMessage);

    this.touchable = true;

    this._init();
  }

  _init() {
    const boardSim = this._boardSim = this.addComponent(new BoardSim());
    const board = this._board = this.addChild(new Board());
    const resultScene = this._resultScene = this.addChild(new GameResultScene());
    const countdownScene = this._countdownScene = this.addChild(new CountdownScene());

    // this.addComponent(new MultiplayerController(this.socket, board, boardSim));
    // const boardController = this._boardController = this.addComponent(new StaticGameController(this.socket, board, boardSim));
    const boardController = this._boardController = this.addComponent(new MultiplayerController(this.socket, board, boardSim));

    boardController.on('win', () => resultScene.showWin())
    boardController.on('lose', () => resultScene.showLose())

    // setTimeout(() => {
    //   resultScene.showLose()
    // }, 1000);

    resultScene.on("continuePressed", () => {
      this.once("hide", () => resultScene.hide())
      this.post("openMainMenu")
    });

    Black.stage.on("resize", this._onResize.bind(this)).callback();
  }

  processMessage(msg, data) {
    this._boardController.processMessage && this._boardController.processMessage(msg, data);
  }

  _onResize() {
    const stage = Black.stage;
    const stageBounds = stage.getBounds();

    const board = this._board;
    const resultScene = this._resultScene;
    const countdownScene = this._countdownScene;

    board.alignAnchor();
    board.x = stage.centerX;
    board.y = stage.centerY;

    const boardOffset = 5;

    board.scale = 1;
    board.scale = Math.min(
      stageBounds.width / (board.width + boardOffset * 2),
      stageBounds.height / (board.height + boardOffset * 2)
    );

    resultScene.onResize(stageBounds);
    countdownScene.onResize(stageBounds);
  }
}