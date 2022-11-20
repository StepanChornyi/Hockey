import { Black, Graphics, CapsStyle, ColorHelper, GraphicsLinearGradient, Timer, MathEx, Vector, RGB, Rectangle, Tween, Ease } from 'black-engine';
import { BOARD_WIDTH, BOARD_HEIGHT, BALL_RADIUS, BALL_MAX_SPEED, GATES_SIZE, BOARD_CENTER, PLAYER_A_WALLS, PLAYER_B_WALLS } from './BoardConfig';
import FixedSizeDisplayObject from '../../../Fix/FixedSizeDisplayObject';
import CollisionEffect from './views/CollisionEffect';
import BoardMarkings from './views/BoardMarkings';
import PlayerView from './views/PlayerView';
import BallView from './views/BallView';
import WallsView from './views/WallsView';
import PlayerInput from './PlayerInput';
import GoalEffect from './views/GoalEffect';
import BallTrail from './views/BallTrail';
import ScoreView from './views/ScoreView';
import ScoreWinLine from './views/ScoreWinLine';

export default class Board extends FixedSizeDisplayObject {
  constructor() {
    super();

    this.touchable = true;

    const boardMarkings =this._boardMarkings =  new BoardMarkings();

    const playerAView = this._playerAView = new PlayerView({
      color: 0xeb3446,
      lightColor: 0xffffff
    });

    const playerBView = this._playerBView = new PlayerView({
      color: 0x58e83f,
      lightColor: 0xffffff
    });

    const ballView = this._ballView = new BallView();
    const wallsView = this._wallsView = new WallsView();

    const goalEffect = this._goalEffect = new GoalEffect();
    const ballTrail = this._ballTrail = new BallTrail();

    const scoreViewA = this._scoreViewA = new ScoreView(0xeb3446);
    const scoreViewB = this._scoreViewB = new ScoreView(0x58e83f);
    const scoreWinLine = this._scoreWinLine = new ScoreWinLine();

    scoreViewA.x = scoreViewB.x = scoreWinLine.x = BOARD_CENTER.x;
    scoreViewA.y = scoreViewB.y = scoreWinLine.y = BOARD_CENTER.y;
    scoreViewA.rotation = MathEx.DEG2RAD * 180;

    this.add(boardMarkings, scoreViewA, scoreViewB, scoreWinLine, ballTrail, goalEffect, wallsView, playerAView, playerBView, ballView);

    this._collisionEffect = this.addChild(new CollisionEffect({
      ballRadius: BALL_RADIUS,
      aColor: 0xfa4144 || playerAView.color,
      bColor: playerBView.color,
    }));

    this._inputA = this.addChild(new PlayerInput(new Rectangle(0, 0, BOARD_WIDTH, BOARD_HEIGHT)));
    this._inputB = this.addChild(new PlayerInput(new Rectangle(0, 0, BOARD_WIDTH, BOARD_HEIGHT)));

    this._maxEffectsPerFrame = 1;
    this._effectsPerFrame = 0;
    this._soundCount = 0;

    this._dynamicObjectsAlpha = 1;

    // this._simulationEnabled = false;
  }

  onRender() {
    this._effectsPerFrame = 0;
  }

  showCollisions(data) {
    this._handleCollisions(data.collisionData, data.ball, data.playerA, data.playerB);
  }

  showScoreWin() {
    this._scoreWinLine.show(0x58e83f);
  }

  showScoreLose() {
    this._scoreWinLine.show(0xeb3446);
  }

  setAScore(score) {
    this._scoreViewA.setScore(score);
  }

  setBScore(score) {
    this._scoreViewB.setScore(score);
  }

  setMaxScore(maxScore) {
    this._scoreViewA.setMaxScore(maxScore);
    this._scoreViewB.setMaxScore(maxScore);
  }

  setCenterColor(isHost){
    this._boardMarkings.setCenterColor(isHost ? 0xf57842 : 0x4298f5);
  }

  hideDynamicObjects() {
    this.addComponent(new Tween({
      dynamicObjectsAlpha: 0,
    }, 0.5, {
      ease: Ease.sinusoidalInOut
    }));
  }

  showGoal(isA, isWin = isA) {
    const pos = new Vector(BOARD_CENTER.x, isA ? 0 : BOARD_HEIGHT);
    const normal = new Vector(0, isA ? 1 : -1);

    this._goalEffect.show(pos, normal, GATES_SIZE, isA);

    const wallsToShine = isA ? PLAYER_A_WALLS : PLAYER_B_WALLS;

    for (let i = 0; i < wallsToShine.length; i++) {
      const { id, ax, bx } = wallsToShine[i];

      const x = Math.abs(ax - pos.x) < Math.abs(bx - pos.x) ? ax : bx;

      this._wallsView.showEffect(id, new Vector(x, pos.y), 1);
    }

    Black.audio.play(isWin ? 'goalWin' : 'goalLose', "master", 0.5);
  }

  setData(data) {
    this._ballView.visible = !data.ball.disabled;

    this._ballView.x = data.ball.x;
    this._ballView.y = data.ball.y;

    if (this._ballView.visible) {
      this._ballTrail.drawTrail(data.ball);
    } else {
      this._ballTrail.resetPos();
    }



    // const CD_A = this._CD_A;
    // const CD_B = this._inputB;

    // CD_A.x = data.playerAController.x;
    // CD_A.y = data.playerAController.y;

    // CD_B.x = data.playerBController.x;
    // CD_B.y = data.playerBController.y;

    this._playerAView.position.copyFrom(data.playerA);

    this._playerBView.position.copyFrom(data.playerB);
  }

  _isCollisionDataContains(collisionData, bodyId) {
    for (let i = 0; i < collisionData.length; i++) {
      const { bodyA, bodyB } = collisionData[i];

      if (bodyA.id === bodyId || bodyB.id === bodyId) {
        return true;
      }
    }

    return false;
  }

  _handleCollisions(collisionsData, ball, playerA, playerB) {
    const maxCollisionsToHandle = 1;

    for (let i = 0; i < collisionsData.length && i < maxCollisionsToHandle; i++) {
      this._handleCollision(collisionsData[i], ball, playerA, playerB);
    }
  }

  _handleCollision(collisionData, ball, playerA) {
    const collisionEffect = this._collisionEffect;

    const bodyB = collisionData.bodyA.id === ball.id ? collisionData.bodyB : collisionData.bodyA;

    collisionEffect.showCollision(ball, collisionData, bodyB.id === playerA.id);

    if (collisionData.isCircle) {
      const playerView = bodyB.id === playerA.id ? this._playerAView : this._playerBView;

      playerView.strokeAlpha = 1;
      playerView.lightT = 1;
      playerView.hitNormal = new Vector().copyFrom(ball).subtract(bodyB).normalize();
    } else {
      const collisionPoint = new Vector().copyFrom(collisionData.normal).multiplyScalar(ball.r).add(ball);

      this._wallsView.showEffect(bodyB.id, collisionPoint);
    }

    const volMultiplier = 1.7 / (1 + this._soundCount);
    const vol = (MathEx.distance(ball.vx, ball.vy, 0, 0) / BALL_MAX_SPEED) * volMultiplier;
    const soundName = collisionData.isCircle ? "hit" : "hitWall";

    Black.audio.play(soundName, "master", vol).on('complete', () => {
      this._soundCount--;
    });

    this._soundCount++;
  }

  get inputA() {
    return this._inputA.inputPos;
  }

  set inputA(pos) {
    this._inputA.inputPos = pos;
  }

  get inputB() {
    return this._inputB.inputPos;
  }

  set inputB(pos) {
    this._inputB.inputPos = pos;
  }


  // get inputAEnabled() {
  //   return this._inputA.touchable;
  // }

  // get inputBEnabled() {
  //   return this._inputB.touchable;
  // }

  get dynamicObjectsAlpha() {
    return this._dynamicObjectsAlpha;
  }

  set dynamicObjectsAlpha(val) {
    this._dynamicObjectsAlpha =
      this._playerAView.alpha =
      this._playerBView.alpha =
      this._ballView.alpha =
      this._goalEffect.alpha =
      this._ballTrail.alpha =
      this._scoreViewA.alpha =
      this._scoreViewB.alpha =
      this._scoreWinLine.alpha = val;
  }

  initAsPlayerA() {
    this.rotation = Math.PI;
    this._inputA.touchable = true;
    this._inputB.touchable = false;
    console.log("initAsPlayerA");
  }

  initAsPlayerB() {
    console.log("initAsPlayerB");

    this.rotation = 0;
    this._inputA.touchable = false;
    this._inputB.touchable = true;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
  }
}