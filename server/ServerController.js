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

  // processMessage(msg, data, socket) {
  //   const model = this.gameModel;

  //   switch (msg) {
  //     case C_LOGIN: {
  //       const player = model.getPlayerById(data.playerId) || model.createPlayer(socket);

  //       if (data.name == undefined)
  //         return;

  //       player.socket = socket;
  //       player.name = data.name;

  //       socket.emit(S_PLAYER_NAME, { name: player.name, playerId: player.id });

  //       this.io.emit(S_PLAYERS_LIST, model.getPlayersListData());
  //       this.io.emit(S_MATCHES_LIST, model.getMatchesListData());

  //       model.save();

  //       logPlayerConnected(player.name);
  //     } return;
  //     case C_RENAME: {
  //       const player = model.getPlayerById(data.playerId);

  //       logPlayerRenamed(player.name, data.name);

  //       player.name = data.name;
  //       player.socket = socket;

  //       socket.emit(S_PLAYER_NAME, { name: player.name, playerId: player.id });

  //       this.io.emit(S_PLAYERS_LIST, model.getPlayersListData());

  //       model.save();
  //     } return;
  //     case C_CREATE_MATCH: {
  //       const match = model.createMatch();

  //       match.addPlayer({ id: data.playerId });

  //       this.io.emit(S_MATCHES_LIST, model.getMatchesListData());

  //       socket.emit(S_INIT_MATCH);
  //     } return;
  //     case C_LEAVE_MATCH: {
  //       const match = model.getMatchByPlayerId(data.playerId);

  //       model.removeMatch(match.id);

  //       this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
  //     } return;
  //     case C_JOIN_MATCH: {
  //       const match = model.getMatchById(data.matchId);

  //       // console.log(data.matchId, model.matches, match);

  //       match.addPlayer({ id: data.playerId });

  //       this.io.emit(S_MATCHES_LIST, model.getMatchesListData());
  //     } return;
  //   }
  // }

  // initClient(socket) {
  //   let player = this.gameModel.createPlayer(socket);

  //   socket.on(C_PLAYER_NAME, ({ name, playerId }) => {
  //     const existingPlayer = this.gameModel.getPlayerById(playerId);

  //     if (existingPlayer)
  //       player = existingPlayer;

  //     if (player.isValid && player.name !== name) {
  //       logPlayerRenamed(player.name, name);
  //     } else {
  //       logPlayerConnected(player.name);
  //     }

  //     player.name = name;
  //     player.id = playerId || player.id;
  //     player.socket = socket;

  //     socket.emit(S_PLAYER_NAME, { name: player.name, playerId: player.id });

  //     this.io.emit(S_PLAYERS_LIST, this.gameModel.getPlayersListData());

  //     this.gameModel.save();
  //   });

  //   socket.once(C_PLAYER_NAME, () => this.initPlayer(player));

  //   socket.on(DISCONNECT, () => {
  //     // const game = this.gameModel.getMatchByPlayerId(player.id);

  //     // if (game && !game.playerB) {
  //     //   this.gameModel.removeGame(game.id);
  //     // }

  //     player.socket = null;

  //     if (player.name) {
  //       console.log('\x1b[33m%s\x1b[0m', `DISCONNECTED: ${player.name}`);
  //     }
  //   });
  // }

  // initPlayer(player) {
  //   const socket = player.socket;

  //   socket.on(C_CREATE_GAME, () => {
  //     const match = this.gameModel.createMatch();

  //     match.addPlayer(player);

  //     this.io.emit(S_MATCHES_LIST, this.gameModel.getMatchesListData());
  //   });

  //   socket.on(C_JOIN_MATCH, (gameID) => {
  //     const game = this.gameModel.getMatchById(gameID);

  //     if (!game) {
  //       return console.warn(`Game (${gameID}) not found for ${player.name}`);
  //     }

  //     game.playerB = player;

  //     game.playerA.socket && game.playerA.socket.emit(S_OPPONENT_CONNECTED);
  //     game.playerB.socket && game.playerB.socket.emit(S_OPPONENT_CONNECTED);

  //     this.initGame(game.playerA, game.playerB);

  //     this.io.emit(S_MATCHES_LIST, this.gameModel.getMatchesListData());
  //   });

  //   socket.on(C_LEAVE_MATCH, () => {
  //     const game = this.gameModel.getMatchByPlayerId(player.id);

  //     this.gameModel.removeMatch(game.id);

  //     game.playerA && game.playerA.socket && game.playerA.socket.emit(S_OPPONENT_LEAVED);
  //     game.playerB && game.playerB.socket && game.playerB.socket.emit(S_OPPONENT_LEAVED);

  //     this.io.emit(S_MATCHES_LIST, this.gameModel.getMatchesListData());
  //   });

  //   const game = this.gameModel.getMatchByPlayerId(player.id);

  //   if (game) {
  //     game.playerA.socket && game.playerA.socket.emit(S_OPPONENT_CONNECTED);
  //     game.playerB.socket && game.playerB.socket.emit(S_OPPONENT_CONNECTED);

  //     this.initGame(game.playerA, game.playerB);
  //   }

  //   socket.emit(S_MATCHES_LIST, this.gameModel.getMatchesListData());
  // }

  // initGame(playerA, playerB) {
  //   const socketA = playerA.socket;
  //   const socketB = playerB.socket;

  //   socketA.emit(S_INIT_GAME);
  //   socketB.emit(S_INIT_GAME);

  //   playerA.isInGame = playerB.isInGame = true;

  //   socketA.emit(S_INIT_AS_A);
  //   socketB.emit(S_INIT_AS_B);

  //   const listenerMatchDataA = (data) => {
  //     socketB.emit(S_MATCH_DATA, data);
  //   };

  //   socketA.on(C_MATCH_DATA, listenerMatchDataA);

  //   const playerPosListener = (pos) => {
  //     socketA.emit(S_OPPONENT_POS, pos);
  //   }

  //   socketB.on(C_PLAYER_POS, playerPosListener);

  //   const onDisconnect = () => {
  //     socketA.emit(S_OPPONENT_DISCONNECTED);
  //     socketB.emit(S_OPPONENT_DISCONNECTED);

  //     socketB.off(C_PLAYER_POS, playerPosListener);
  //     socketB.off(C_MATCH_DATA, listenerMatchDataA);

  //     socketA.off(DISCONNECT, onDisconnect);
  //     socketB.off(DISCONNECT, onDisconnect);

  //     playerA.isInGame = playerB.isInGame = false;
  //   };

  //   socketA.once(DISCONNECT, onDisconnect);
  //   socketB.once(DISCONNECT, onDisconnect);
  // }

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