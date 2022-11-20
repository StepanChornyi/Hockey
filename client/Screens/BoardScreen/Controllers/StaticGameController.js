import { Black, Component, Graphics } from "black-engine";

import InputPopup from "../../../InputPopup";
import GameModel from "../../../GameModel";
import { CONNECT, C_MATCH_DATA, C_PLAYER_NAME, C_PLAYER_POS, DISCONNECT, S_INIT_AS_A, S_INIT_AS_B, S_MATCH_DATA, S_OPPONENT_DISCONNECTED, S_OPPONENT_POS, S_PLAYER_NAME } from "../../../../Protocol";
// import BoardSim from "./Board/BoardSim";

export default class StaticGameController extends Component {
  constructor(socket, board, boardSim) {
    super();

    this._socket = socket;
    this._board = board;
    this._boardSim = boardSim;

    this.touchable = true;
    this.actAsServer = true;/////////////
    this.lastTimeStamp = -1;
    this.lastData = null;

    boardSim.isPaused = false;

    this._playerAScore = 0;
    this._playerBScore = 0;

    this._init();
  }

  _init() {
    const socket = this._socket;
    const boardSim = this._boardSim;
    const board = this._board;

    this._initSocket();

    // setTimeout(()=>{
    //   boardSim.post('goal');
    //   setTimeout(()=>{
    //   boardSim.post('goal');

    //     setTimeout(()=>{
    //       boardSim.post('goal');

    //     }, 1000);
    //   }, 1000);
    // }, 1000);

    boardSim.on('goal', (_, isA) => {

      if (isA)
        board.setBScore(++this._playerBScore)
      else
        board.setAScore(++this._playerAScore)

      if (this._playerBScore >= 3) {
        setTimeout(() => {
          board.showScoreWin()
          setTimeout(() => {
            this.post('win');
          }, 250);
        }, 150);
      } else {
        if (this._playerAScore >= 3) {
          setTimeout(() => {
            board.showScoreLose()
            setTimeout(() => {
              this.post('lose');
            }, 250);
          }, 150);
        }
      }


      board.showGoal(isA);
    })

    board.inputA = boardSim.playerA.position;
    board.inputB = boardSim.playerB.position;

    board.initAsPlayerB(socket)

    socket.on(S_INIT_AS_A, () => {
      boardSim.isPaused = false;
      this.actAsServer = true;

      socket.on(S_OPPONENT_POS, (pos) => {
        board.inputB = JSON.parse(pos);
        boardSim.playerBController.copyFrom(JSON.parse(pos));
      });

      board.initAsPlayerA()
    });

    socket.on(S_INIT_AS_B, () => {
      boardSim.isPaused = false;
      this.actAsServer = false;

      this.on('render', () => {
        socket.emit(C_PLAYER_POS, board.inputB);
      })

      socket.on(S_MATCH_DATA, (data) => {
        data = JSON.parse(data);

        if (this.lastTimeStamp > data.timeStamp)
          return;

        this.lastTimeStamp = data.timeStamp

        // board.inputA = data.playerAController;
        // boardSim.playerAController.copyFrom(board.inputA);

        board.showCollisions(data);

        boardSim.data = data;

        this.lastData = data;
      });

      board.initAsPlayerB()
    });

    // boardSim.isPaused = true;/////////////

    this.onRender(true);
  }

  _initSocket() {
    const socket = this._socket;

    const setNickname = (nickname) => {
      GameModel.nickname = nickname;

      socket.emit(C_PLAYER_NAME, { name: GameModel.nickname, playerId: GameModel.playerId });
    }

    InputPopup.on("nickname", (_, nickname) => {
      setNickname(nickname);
    })

    socket.on(CONNECT, () => {
      InputPopup.hide();

      if (GameModel.nickname) {
        setNickname(GameModel.nickname);
      } else {
        InputPopup.showEnterNicknamePopup(false);
      }
    })

    socket.on(S_PLAYER_NAME, ({ name, playerId }) => {
      // this._boardSim.isPaused = false;////?

      GameModel.nickname = name;
      GameModel.playerId = playerId;

      console.log(`%cConnected as ${GameModel.nickname} %c(${GameModel.playerId})`, "color: #62de77", 'color: #585a5f');
    })

    socket.on(S_OPPONENT_DISCONNECTED, () => {
      this._boardSim.isPaused = true;
      InputPopup.showOpponentDisconnected();
    });

    socket.on(DISCONNECT, () => {
      InputPopup.showConnectionLost();
    });

    // const timeoutId = setTimeout(() => {
    //   if (socket.disconnected) {
    //     InputPopup.showConnectionLost();
    //   }

    //   clearTimeout(timeoutId)
    // }, 400);
  }

  onUpdate() {
    const boardSim = this._boardSim;
    const board = this._board;

    if (boardSim.isPaused)
      return;

    if (!this.actAsServer) {
      boardSim.playerBController.copyFrom(board.inputB);
    } else {

    }

    boardSim.playerAController.copyFrom(board.inputA);
    boardSim.playerBController.copyFrom(board.inputB);/////////////

    boardSim.update();

    // board.inputA = boardSim.playerAController;
    // board.inputB = boardSim.playerBController;
  }

  onRender(forcedUpdate = false) {
    const boardSim = this._boardSim;
    const board = this._board;

    this.post('render');

    const data = boardSim.data;

    if (this.actAsServer) {
      board.showCollisions(data);
    }

    board.setData(data);

    if (!this.actAsServer && !forcedUpdate)
      return;

    this._socket.emit(C_MATCH_DATA, JSON.stringify(data))
  }
}