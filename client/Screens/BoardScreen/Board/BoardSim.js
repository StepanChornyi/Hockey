import { Black, Graphics, CapsStyle, ColorHelper, GraphicsLinearGradient, Timer, MathEx, GameObject, Vector, Component } from 'black-engine';
import { BOARD_WIDTH, BOARD_HEIGHT, PLAYER_A_BOX, PLAYER_B_BOX, PLAYER_RADIUS, BALL_RADIUS, WALL_RADIUS, WALL_WIDTH, WALLS_CONFIG, CIRCLES_CONFIG, PLAYER_MAX_SPEED, BALL_MAX_SPEED, BOARD_CENTER } from './BoardConfig';
import CircleBody from '../../../CustomPhysics/CircleBody';
import PhysicsWorld from '../../../CustomPhysics/PhysicsWorld';
import SegmentBody from '../../../CustomPhysics/SegmentBody';
import Utils from '../../../Utils';

export default class BoardSim extends Component {
  constructor() {
    super();

    this._playerAController = new Vector();
    this._playerBController = new Vector();
    this._collisionsData = [];
    this._isPaused = true;

    const ball = this._ball = CircleBody.createFrom(CIRCLES_CONFIG.ball);
    const playerA = this._playerA = CircleBody.createFrom(CIRCLES_CONFIG.playerA);
    const playerB = this._playerB = CircleBody.createFrom(CIRCLES_CONFIG.playerB);

    playerA.maxSpeed = PLAYER_MAX_SPEED;
    playerB.maxSpeed = PLAYER_MAX_SPEED;
    ball.maxSpeed = BALL_MAX_SPEED;

    playerA.segmentsCheck = false;
    playerB.segmentsCheck = false;

    const world = this._world = new PhysicsWorld();

    for (let i = 0; i < WALLS_CONFIG.length; i++) {
      const { id, ax, ay, bx, by, r, visible } = WALLS_CONFIG[i];
      const segment = new SegmentBody(ax, ay, bx, by, r, visible ? undefined : 0x222222);

      segment.id = id;

      world.add(segment);
    }

    world.add(ball, playerA, playerB);

    ball.collisionCallback = (data) => {
      this._collisionsData.push({
        bodyA: data.bodyA.toData(),
        bodyB: data.bodyB.toData(),
        normal: data.normal || null,
        isCircle: data.isCircle,
      })
    };

    playerA.position.copyFrom(PLAYER_A_BOX.center());
    playerB.position.copyFrom(PLAYER_B_BOX.center());

    this.playerAController.copyFrom(playerA);
    this.playerBController.copyFrom(playerB);
  }

  update(dt = Black.time.delta, forced = false) {
    if (this.isPaused && !forced)
      return;

    const playerA = this.playerA;
    const playerB = this.playerB;
    const ball = this.ball;

    Utils.clampToRect(this.playerAController, PLAYER_A_BOX);
    Utils.clampToRect(this.playerBController, PLAYER_B_BOX);

    playerA.setVelocity(
      this.playerAController
        .clone()
        .subtract(playerA.position)
        .multiplyScalar(1 / dt),
      false
    );

    playerB.setVelocity(
      this.playerBController
        .clone()
        .subtract(playerB.position)
        .multiplyScalar(1 / dt),
      false
    );

    this._world.update(dt);

    if (!ball.disabled && this._isRoundOver()) {
      ball.disabled = true;

      this.post('goal', ball.y < BOARD_CENTER.y);

      setTimeout(() => {
        this.resetBall();
      }, 1000);
    }
  }

  resetBall() {
    const ball = this.ball;

    ball.x = BOARD_WIDTH * 0.5;
    ball.y = BOARD_HEIGHT * 0.5;
    ball.vx = 0;
    ball.vy = 0;

    ball.disabled = false;
  }

  _isRoundOver() {
    return Math.abs(BOARD_HEIGHT * 0.5 - this._ball.y) > (BOARD_HEIGHT * 0.5 + BALL_RADIUS * 2);
  }

  get playerAController() {
    return this._playerAController;
  }

  get playerBController() {
    return this._playerBController;
  }

  get collisionsData() {
    return this._collisionsData.splice(0);
  }

  get playerA() {
    return this._playerA;
  }

  get playerB() {
    return this._playerB;
  }

  get ball() {
    return this._ball;
  }

  get isPaused() {
    return this._isPaused;
  }

  get data() {
    return {
      ball: this.ball.toData(),
      playerA: this.playerA.toData(),
      playerB: this.playerB.toData(),

      playerAController: this.playerAController,
      playerBController: this.playerBController,

      collisionData: this.collisionsData,
      timeStamp: Date.now()
    }
  }

  set data(data) {
    this.ball.copyFrom(data.ball, this._world);
    this.playerA.copyFrom(data.playerA, this._world);
    this.playerB.copyFrom(data.playerB, this._world);

    this.playerAController.copyFrom(data.playerAController);
    this.playerBController.copyFrom(data.playerBController);

    const dt = (Date.now() - data.timeStamp) * 0.001;

    if (dt > 0)
      this.update(dt, true);
  }

  set isPaused(val) {
    this._isPaused = !!val;
  }
}