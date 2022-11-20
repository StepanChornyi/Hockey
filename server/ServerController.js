const {
  S_PLAYER_NAME,

  S_INIT_MATCH,

  S_MATCHES_LIST,
  S_PLAYERS_LIST,

  S_OPPONENT_LEAVED,
  S_OPPONENT_CONNECTED,
  S_INIT_AS_A,
  S_INIT_AS_B,
  S_MATCH_DATA,
  S_HOST_PLAYER_CHANGED,
  S_OPPONENT_DISCONNECTED,
  S_OPPONENT_POS,

  C_LOGIN,
  C_RENAME,

  C_CREATE_MATCH,
  C_LEAVE_MATCH,

  C_JOIN_MATCH,
  C_MATCH_DATA,
  C_PLAYER_POS,
  C_SWITCH_HOST_PLAYER,

  C_PLAYER_NAME,

  DISCONNECT,
  CONNECTION,
  S_LEAVE_MATCH,
  S_START_MATCH,
  C_GOAL,
  S_GOAL,
  S_GAME_OVER,
  S_SYNC,
} = require("../Protocol");

class ServerController {
  constructor(io, gameModel) {
    this._io = io;
    this._gameModel = gameModel;

    gameModel.print();

    const clb = this._initFunctions();

    // io.on(CONNECTION, this.initClient.bind(this));
    io.on(CONNECTION, (socket) => {
      const onMsg = (msg, data) => {
        const callback = clb[msg];

        if (callback) {
          callback(JSON.parse(data || "{}"), socket)
        } else {
          console.log(msg);
        }
      }


      socket.onAny(onMsg);
      socket.on(DISCONNECT, () => onMsg(DISCONNECT));


      // socket.onAny((msg, data) => this.processMessage(msg, JSON.parse(data || "{}"), socket));
      // socket.on(DISCONNECT, () => this.processMessage(DISCONNECT, {}, socket));
    });
  }

  _initFunctions() {
    const model = this.gameModel;
    const clb = {};

    clb[C_LOGIN] = (data, socket) => {
      const player = model.getPlayerById(data.playerId) || model.createPlayer(socket);

      if (data.name == undefined)
        return;

      player.socket = socket;
      player.name = data.name;

      socket.emit(S_PLAYER_NAME, { name: player.name, playerId: player.id });
      socket.emit(S_SYNC, { now: Date.now() });

      this.io.emit(S_PLAYERS_LIST, model.getPlayersListData());
      this.io.emit(S_MATCHES_LIST, model.getMatchesListData());

      model.save();

      logPlayerConnected(player.name);
    }

    clb[C_CREATE_MATCH] = (data, socket) => {
      const match = model.createMatch();

      match.addPlayer({ id: data.playerId });

      socket.emit(S_INIT_MATCH, { playerIndex: match.players.indexOf(data.playerId), matchId: match.id, hostPlayerIndex: match.hostPlayerIndex });

      this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
    }

    clb[C_LEAVE_MATCH] = (data, socket) => {
      const match = model.getMatchByPlayerId(data.playerId);

      model.removeMatch(match.id);

      this.playersEmit(match, S_LEAVE_MATCH);

      this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
    }

    clb[C_JOIN_MATCH] = (data, socket) => {
      const match = model.getMatchById(data.matchId);

      match.addPlayer({ id: data.playerId });

      socket.emit(S_INIT_MATCH, { playerIndex: match.players.indexOf(data.playerId), matchId: match.id, hostPlayerIndex: match.hostPlayerIndex });

      this.playersEmit(match, S_START_MATCH, { maxScore: match.maxScore });

      this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
    }

    clb[C_MATCH_DATA] = (data, socket) => {
      const match = model.getMatchById(data.matchId);

      this.playersEmit(match, S_MATCH_DATA, data, data.playerId);

    }

    clb[C_PLAYER_POS] = (data) => {
      const match = model.getMatchById(data.matchId);

      this.playersEmit(match, S_OPPONENT_POS, data, data.playerId);
    }

    clb[C_SWITCH_HOST_PLAYER] = (data) => {
      const match = model.getMatchById(data.matchId);

      if (!match)
        return;

      match.hostPlayerIndex = (data.playerIndex + 1) % 2;

      data = match.toDataJS();

      this.playersEmit(match, S_HOST_PLAYER_CHANGED, data);
    }

    clb[C_GOAL] = (data) => {
      const match = model.getMatchById(data.matchId);

      match.scores[data.goalPlayerIndex]++;

      this.playersEmit(match, S_GOAL, {
        goalPlayerIndex: data.goalPlayerIndex,
        scores: match.scores
      });

      if (match.isFinished) {
        this.playersEmit(match, S_GAME_OVER, {
          winPlayerIndex: match.winPlayerIndex
        });

        model.removeMatch(match.id);
        this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
      }
    }

    clb[DISCONNECT] = (_, socket) => {
      let disconnectedPlayerId = NaN;

      for (let i = 0; i < model.players.length; i++) {
        const player = model.players[i];

        if (player.socket && player.socket.id === socket.id) {
          disconnectedPlayerId = player.id;
          break;
        }
      }

      if (!disconnectedPlayerId)
        return;

      const match = model.getMatchByPlayerId(disconnectedPlayerId);

      if (match) {
        this.playersEmit(match, S_LEAVE_MATCH);
        model.removeMatch(match.id);
      }

      this.io.emit(S_PLAYERS_LIST, model.getPlayersListData());
      this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
    }

    return clb;
  }

  playersEmit(match, msg, data, exceptId = null) {
    if (!match)
      return;

    for (let i = 0; i < match.players.length; i++) {
      if (match.players[i] === exceptId)
        continue;

      const player = this.gameModel.getPlayerById(match.players[i]);

      player.isConnected && player.socket.emit(msg, data);
    }
  }

  get gameModel() {
    return this._gameModel;
  }

  get io() {
    return this._io;
  }

  static init(io, gameModel) {
    return new ServerController(io, gameModel);
  }
}

function logPlayerConnected(name) {
  console.log('\x1b[35m%s\x1b[0m', `CONNECTED: ${name}`);
}

function logPlayerRenamed(oldName, newName) {
  console.log('\x1b[36m%s\x1b[0m', `RENAMED: ${oldName} > ${newName}`);
}

module.exports = { ServerController };