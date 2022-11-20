const fs = require('fs');
const jsonFormat = require('json-format');
const { MatchModel } = require('./MatchModel');

const { PlayerModel } = require('./PlayerModel');

const DATA_FILE = './data/game-data.json';

const DATA_FORMAT_CONFIG = {
  type: 'space',
  size: 2
}

let idCounter = 0;

class DataManager {
  constructor() {
    this.players = [];
    this.matches = [];

    // this.clear();

    this._loadData();
  }

  _loadData() {
    try {
      const data = fs.readFileSync(DATA_FILE).toString();

      if (!data || data.length === 0) {
        return;
      }

      const dataJS = JSON.parse(data.toString());

      if (!dataJS.players || !dataJS.players.length === 0) {
        return;
      }

      idCounter = dataJS.idCounter;

      for (let i = 0; i < dataJS.players.length; i++) {
        this.players.push(PlayerModel.fromData(dataJS.players[i]));
      }
    } catch (err) {
      throw err;
    }
  }

  save() {
    const validPlayers = this.players
      .filter((e) => e.isValid)
      .map((e) => e.toDataJS());

    const saveValueStr = jsonFormat({ players: validPlayers, idCounter }, DATA_FORMAT_CONFIG);

    fs.writeFile(DATA_FILE, saveValueStr, function (err) {
      err && console.error(err);
    });
  }

  clear() {
    idCounter = 0;

    this.players = [];
    this.save();
  }

  createPlayer() {
    const player = new PlayerModel(++idCounter);

    this.players.push(player);

    return player;
  }

  createMatch() {
    const match = new MatchModel(++idCounter);

    this.matches.push(match);

    this.save();

    return match;
  }

  getMatchesListData() {
    return this._getElementsData(this.matches);
  }

  getPlayersListData() {
    return this._getElementsData(this.players.filter(e => e.name && e.isConnected));
  }

  getMatchByPlayerId(playerId) {
    for (let i = 0; i < this.matches.length; i++) {
      const match = this.matches[i];

      if (match.has({ id: playerId }))
        return match;
    }

    return null;
  }

  removeMatch(matchId) {
    const newMatchesArr = [];

    for (let i = 0; i < this.matches.length; i++) {
      if (this.matches[i].id !== matchId) {
        newMatchesArr.push(this.matches[i]);
      }
    }

    this.matches = newMatchesArr;
  }

  getPlayerById(playerId) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === playerId) {
        return this.players[i];
      }
    }

    return null;
  }

  getMatchById(matchId) {
    for (let i = 0; i < this.matches.length; i++) {
      if (this.matches[i].id === matchId) {
        return this.matches[i];
      }
    }

    return null;
  }

  print() {
    let str = "";

    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];

      if (i)
        str += "\n";

      str += player.id + ": " + player.name
    }

    console.log(str);
  }

  _getElementsData(elements) {
    const data = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      data.push(element.toDataJS ? element.toDataJS() : element);
    }

    return JSON.stringify(data);
  }
}

module.exports = { DataManager };