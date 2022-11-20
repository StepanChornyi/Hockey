class PlayerModel {
  constructor(id) {
    this.id = id;
    this.name = null;
    this.socket = null;

    this.isInGame = false;
  }

  get isValid() {
    return !!this.name;
  }

  get isConnected() {
    return this.socket !== null && this.socket.connected;
  }

  get canJoinToGame() {
    return !this.isInGame && this.isValid && this.isConnected;
  }

  toDataJS() {
    return {
      id: this.id,
      name: this.name
    }
  }

  static fromData(data) {
    const player = new PlayerModel(data.id);

    player.name = data.name || null;

    return player;
  }
}

module.exports = { PlayerModel };