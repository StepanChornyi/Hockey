
class MatchModel {
  constructor(id) {
    this.id = id;

    this.players = [];
    this.scores = [0, 0];
    this.maxScore = 10;
    this.hostPlayerIndex = 1;
  }

  addPlayer(player) {
    this.players.push(player.id);
  }

  has(player) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i] === player.id)
        return true;
    }
  }

  get isWaiting() {
    return this.players.length === 1;
  }

  get isFinished() {
    for (let i = 0; i < this.scores.length; i++) {
      if (this.scores[i] >= this.maxScore) {
        return true;
      }
    }

    return false;
  }

  get winPlayerIndex() {
    if (!this.isFinished)
      return null;

    for (let i = 0; i < this.scores.length; i++) {
      if (this.scores[i] < this.maxScore) {
        return i;
      }
    }
  }

  toDataJS() {
    return {
      id: this.id,
      isWaiting: this.isWaiting,
      players: this.players,
      hostPlayerIndex: this.hostPlayerIndex,
      maxScore: this.maxScore,
    }
  }
}

module.exports = { MatchModel };