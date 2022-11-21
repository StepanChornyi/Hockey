import { GameObject, Black, Sprite, Graphics, GraphicsLinearGradient, ColorHelper, DisplayObject } from 'black-engine';
import { io } from "socket.io-client";

import loadAssets from './Assets';
import CursorComponent from './Fix/CursorComponent';
import InputPopup from './InputPopup';

import BoardScreen from './Screens/BoardScreen/BoardScreen';
import MainMenuScreen from './Screens/MainMenuScreen/MainMenuScreen';

import { CONNECT, C_CREATE_MATCH, S_PLAYER_NAME, C_LEAVE_MATCH, S_OPPONENT_CONNECTED, S_OPPONENT_LEAVED, C_RENAME, C_LOGIN, S_INIT_MATCH, S_LEAVE_MATCH, S_START_MATCH, C_MATCH_DATA, S_MATCH_DATA, C_PLAYER_POS, S_OPPONENT_POS, S_MATCHES_LIST, S_SYNC } from '../Protocol.js';
import Background from './Screens/Background/Background';
import GameModel from './GameModel';
import TransitionOverlay from './Screens/TransitionOverlay';
import PopupManager from './Screens/PopupManager/PopupManager';

export default class Game extends GameObject {
  constructor() {
    super();

    this.touchable = true;
    this.isLoggedIn = false;

    loadAssets(() => { this._onAssetsLoadded() });

    this.addComponent(new CursorComponent());
  }

  _onAssetsLoadded() {
    const socket = this.socket = io('ws://192.168.3.7:8080');

    this.addChild(new Background());

    this._activeScreen = null;

    this._screensContainer = this.addChild(new GameObject());
    this._boardScreen = new BoardScreen(socket, this._emitMessage.bind(this));
    this._mainMenuScreen = new MainMenuScreen(socket, this._emitMessage.bind(this));
    this._transitionOverlay = this.addChild(new TransitionOverlay());
    this._popupManager = this.addChild(new PopupManager());

    socket.onAny(this._onMessage.bind(this));

    socket.on(CONNECT, () => this._onMessage(CONNECT))

    InputPopup.on("leaveBtnClicked", () => {
      Black.audio.play("click", "master", 0.5);
      this._emitMessage(C_LEAVE_MATCH);
    })


    this._popupManager.on("createGame", () => {
      this._popupManager.showPopup(PopupManager.WaitingOpponentPopup);
      this._emitMessage(C_CREATE_MATCH);
      // InputPopup.showWaitingForOpponent();
    })

    this._popupManager.on("cancelGame", () => {
      this._emitMessage(C_LEAVE_MATCH);
      this._popupManager.hide();
    })

    

    // InputPopup.on("createGame", () => {
    //   Black.audio.play("click", "master", 0.5);

    //   this._emitMessage(C_CREATE_MATCH);
    //   InputPopup.showWaitingForOpponent();
    // })

    InputPopup.on("nickname", (_, nickname) => {
      Black.audio.play("click", "master", 0.5);
      this._setNickname(nickname);
    })

    this._boardScreen.on("openMainMenu", () => {
      this._showScreen(this._mainMenuScreen);
    })

    this._mainMenuScreen.on("createGame", () => {
      this._popupManager.showPopup(PopupManager.CreateGamePopup);
    })

    // this._showScreen(this._boardScreen);
    this._showScreen(this._mainMenuScreen);
  }

  _emitMessage(msg, data = {}, screen = this._activeScreen) {
    if (this._activeScreen !== screen)
      return;

    data.playerId = GameModel.playerId || NaN;

    this._logMsg(msg, 'color: #e6bd43', data);

    this.socket.emit(msg, JSON.stringify(data));
  }

  _onMessage(msg, data) {
    const boardScreen = this._boardScreen;
    const mainMenuScreen = this._mainMenuScreen;

    this._logMsg(msg, (msg.indexOf("S_") >= 0) ? 'color: #55da6d' : '', data);

    switch (msg) {
      case S_OPPONENT_CONNECTED:
        this._popupManager.hide();
        // this._showScreen(boardScreen);
        break;
      case S_OPPONENT_LEAVED:
        this._showScreen(mainMenuScreen);
        break;
      case S_INIT_MATCH:

        GameModel.matchId = data.matchId;
        GameModel.playerIndex = data.playerIndex;
        GameModel.hostPlayerIndex = data.hostPlayerIndex;

        boardScreen.processMessage(msg, data);


        // this._showScreen(boardScreen);
        break;
      case S_START_MATCH:
        this._showScreen(boardScreen);
        this._popupManager.hide();
        break;
      case S_LEAVE_MATCH:
        this._showScreen(mainMenuScreen);
        break;
      case S_PLAYER_NAME:
        if (!data.name) {
          InputPopup.showEnterNicknamePopup(false);
        } else {
          GameModel.nickname = `${data.name}`;
          GameModel.playerId = data.playerId;
          this.isLoggedIn = true;
        }
        break;
      case S_MATCHES_LIST:
        if (this._activeScreen !== mainMenuScreen)
          mainMenuScreen.processMessage(msg, data);
        break;
      case CONNECT:
        InputPopup.hide();

        if (GameModel.nickname) {
          this._emitMessage(C_LOGIN, { name: GameModel.nickname });
        } else {
          InputPopup.showEnterNicknamePopup(false);
        }

        this._showScreen(mainMenuScreen);
        break;
      case S_SYNC:
        GameModel.timeDelay = Date.now() - data.now;
        break;
    }

    if (this._activeScreen) {
      this._activeScreen.processMessage(msg, data);
    }
  }

  _logMsg(msg, color = '', data = '') {
    if (unLoggedMsg.indexOf(msg) !== -1)
      return;

    console.log(`%c${msg}   `, color, data);
  }

  _showScreen(screen) {
    if (screen === this._activeScreen)
      return;

    if (!this._activeScreen) {
      this._screensContainer.removeAllChildren();
      this._screensContainer.addChild(screen);
    } else {
      this._transitionOverlay.showTransition(() => {
        this._screensContainer.removeAllChildren();
        this._screensContainer.addChild(screen);

        this._activeScreen.post('hide');
        screen.post('show');
      });
    }

    this._screensContainer.touchable = true;

    this._activeScreen = screen;
  }

  _setNickname(nickname) {
    GameModel.nickname = nickname;

    const data = { name: GameModel.nickname };

    if (!this.isLoggedIn) {
      this._emitMessage(C_LOGIN, data);
    } else {
      this._emitMessage(C_RENAME, data);
    }
  }
}

const unLoggedMsg = [C_MATCH_DATA, S_MATCH_DATA, C_PLAYER_POS, S_OPPONENT_POS];