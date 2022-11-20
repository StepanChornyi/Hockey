import { MessageDispatcher } from "black-engine";

class GameModel extends MessageDispatcher {
  constructor() {
    super();

    // this.clear();  

    this._nickname = this.nickname;
    this._playerId = this.playerId;

    this.players = [];
    this.matches = [];
    this.matchId = 0;
    this.playerIndex = 0;
    this.hostPlayerIndex = 0;
  }

  get isHost() {
    return this.playerIndex === this.hostPlayerIndex;
  }

  getPlayerById(id) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === id) {
        return this.players[i];
      }
    }

    return null;
  }

  get playerId() {
    if (this._playerId)
      return parseInt(this._playerId);

    return parseInt(localStorage.getItem("playerId"));
  }

  set playerId(val) {
    const changed = this._playerId !== val;

    this._playerId = val;

    localStorage.setItem("playerId", val);

    if (changed) {
      this.post("playerIdChanged");
    }
  }

  get nickname() {
    if (this._nickname)
      return this._nickname;

    return localStorage.getItem("nickname");
  }

  set nickname(val) {
    const changed = this._nickname !== val;

    this._nickname = val;

    localStorage.setItem("nickname", val ? val : '');

    if (changed) {
      this.post("nicknameChanged");
    }
  }

  clear() {
    this.playerId = '';
    this.nickname = '';
  }
}

GameModel = new GameModel();

export default GameModel;