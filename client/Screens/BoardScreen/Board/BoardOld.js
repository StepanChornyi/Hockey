import { Black, Graphics, CapsStyle, ColorHelper, GraphicsLinearGradient, Timer, MathEx, Vector } from 'black-engine';
import { SCENE_WIDTH, SCENE_HEIGHT, PLAYER_A_BOX, PLAYER_B_BOX, PLAYER_RADIUS, BALL_RADIUS, WALL_RADIUS, WALL_WIDTH, WALLS_CONFIG, CIRCLES_CONFIG } from './BoardConfig';
import CircleBody from '../../../CustomPhysics/CircleBody';
import PhysicsDebug from '../../../CustomPhysics/PhysicsDebug';
import PhysicsWorld from '../../../CustomPhysics/PhysicsWorld';
import SegmentBody from '../../../CustomPhysics/SegmentBody';
import Vec2 from '../../../CustomPhysics/Vec2';
import DraggableCircle from './DraggableCircle';
import FixedSizeDisplayObject from '../../../Fix/FixedSizeDisplayObject';
import Utils from '../../../Utils';
import CollisionEffect from './views/CollisionEffect';
import BoardSim from './BoardSim';

const wallViews = [];

for (let i = 0; i < WALLS_CONFIG.length; i++) {
  const { id, visible } = WALLS_CONFIG[i];

  if (visible) {
    wallViews[id] = {
      t: 0
    }
  }
}

export default class BoardOld extends FixedSizeDisplayObject {
  constructor() {
    super();

    this.touchable = true;

    // const boardSim = this._boardSim = this.addComponent(new BoardSim());

    const ball = this._ball = CircleBody.createFrom(CIRCLES_CONFIG.ball);
    const playerA = this._playerA = CircleBody.createFrom(CIRCLES_CONFIG.playerA);
    const playerB = this._playerB = CircleBody.createFrom(CIRCLES_CONFIG.playerB);

    playerA.maxSpeed = 1900;
    playerB.maxSpeed = 1900;
    ball.maxSpeed = 2000;

    playerA.segmentsCheck = false;
    playerB.segmentsCheck = false;

    ball.color = null;
    playerA.color = 0xeb3446;
    playerB.color = 0x58e83f;

    playerA.lightColor = 0xffffff;
    playerB.lightColor = 0xffffff;

    playerA.lightT = 0;
    playerB.lightT = 0;

    const world = this._world = new PhysicsWorld();

    for (let i = 0; i < WALLS_CONFIG.length; i++) {
      const { id, ax, ay, bx, by, r, visible } = WALLS_CONFIG[i];
      const segment = new SegmentBody(ax, ay, bx, by, r, visible ? undefined : 0x222222);

      segment.id = id;

      world.add(segment);
    }

    world.add(ball, playerA, playerB);

    this.addChild(createGameFieldMarkings());
    this._walls = this.addChild(new Graphics());

    this.addChild(new PhysicsDebug(world));

    const collisionEffect = this.addChild(new CollisionEffect({
      ballRadius: BALL_RADIUS,
      aColor: 0xfa4144 || playerA.color,
      bColor: playerB.color,
    }));

    ball.collisionCallback = (data) => {
      if (this._effectsPerFrame === this._maxEffectsPerFrame) {
        return;
      }

      collisionEffect.showCollision(ball, data);

      const bodyB = data.bodyA === ball ? data.bodyB : data.bodyA;

      if (data.isCircle) {
        const ticsCount = 15;
        let currentTicks = 0;
        const timer = this.addComponent(new Timer(0.016, ticsCount, true));

        bodyB.strokeAlpha = 1;
        bodyB.lightT = 1;
        bodyB.hitNormal = ball.position.clone().subtract(bodyB).normalize();

        timer.on('tick', () => {
          currentTicks++;

          bodyB.strokeAlpha = 1 - currentTicks / ticsCount;
        });

        timer.on('complete', () => {
          bodyB.strokeAlpha *= 0;

          this.removeComponent(timer);
        });
      } else {
        if (wallViews[bodyB.id]) {
          const collisionPoint = data.normal.clone().multiplyScalar(ball.radius).add(ball.position);

          wallViews[bodyB.id].t = 1;
          wallViews[bodyB.id].collisionPoint = collisionPoint;
          wallViews[bodyB.id].ct = 0;
        }
        // bodyB.colorT = 1;
      }

      const volMultiplier = 1.5 / (1 + this._soundCount);
      const vol = (ball.velocity.length() / ball.maxSpeed) * volMultiplier;
      const soundName = data.isCircle ? "hit" : "hitWall";

      Black.audio.play(soundName, "master", vol).on('complete', () => {
        this._soundCount--;
      });

      this._effectsPerFrame++;
      this._soundCount++;
    };

    const CD_A = this._CD_A = this.addChild(new DraggableCircle(undefined, 50));
    const CD_B = this._CD_B = this.addChild(new DraggableCircle(undefined, 50));

    PLAYER_A_BOX.center().copyTo(CD_A);
    PLAYER_B_BOX.center().copyTo(CD_B);

    playerA.position.copyFrom(CD_A);
    playerB.position.copyFrom(CD_B);

    this._maxEffectsPerFrame = 1;
    this._effectsPerFrame = 0;
    this._soundCount = 0;

    this._simulationEnabled = false;
  }

  initAsPlayerA(socket) {
    this.rotation = Math.PI;
    this._simulationEnabled = true;

    this._initSocket(socket, this._CD_A, this._CD_B);

    socket.on("matchData", (matchData) => {
      matchData = JSON.parse(matchData);

      this._ball.x = matchData.ball.x;
      this._ball.y = matchData.ball.y;
      this._ball.disabled = matchData.ball.disabled;

      this._playerA.x = matchData.playerA.x;
      this._playerA.y = matchData.playerA.y;

      this._playerB.x = matchData.playerB.x;
      this._playerB.y = matchData.playerB.y;
    })

    console.log("Init A");
  }

  initAsPlayerB(socket) {
    this.rotation = 0;
    this._simulationEnabled = true;

    this._initSocket(socket, this._CD_B, this._CD_A);

    this.on("render", () => {
      const matchData = {
        ball: {
          x: this._ball.x,
          y: this._ball.y,
          disabled: this._ball.disabled
        },
        playerA: {
          x: this._playerA.x,
          y: this._playerA.y
        },
        playerB: {
          x: this._playerB.x,
          y: this._playerB.y
        }
      };

      socket.emit("matchData", JSON.stringify(matchData));
    })
    console.log("Init B");
  }

  _initSocket(socket, you, opponent) {
    // opponent.touchable = false;

    socket.on("opponentMove", (pos) => {
      pos = JSON.parse(pos);

      opponent.x = pos.x;
      opponent.y = pos.y;
    })

    you.on("move", () => {
      socket.emit("playerMove", JSON.stringify({ x: you.x, y: you.y }));
    })

    this.post("hidePopup");
  }

  onRender() {
    drawWalls(this._walls);

    this._effectsPerFrame = 0;
    this.post("render");
  }

  onUpdate() {
    const dt = Black.time.delta;

    const CD_A = this._CD_A;
    const CD_B = this._CD_B;
    const playerA = this._playerA;
    const playerB = this._playerB;

    CD_A.updateDrag();
    CD_B.updateDrag();

    if (!this._simulationEnabled) {

      return;
    }

    playerB.setVelocity(
      Utils.clampToRect(Vec2.createFrom(CD_B), PLAYER_B_BOX).copyTo(CD_B)
        .subtract(playerB.position)
        .multiplyScalar(1 / dt),
      false
    );


    playerA.setVelocity(
      Utils.clampToRect(Vec2.createFrom(CD_A), PLAYER_A_BOX).copyTo(CD_A)
        .subtract(playerA.position)
        .multiplyScalar(1 / dt),
      false
    );

    this._world.update(dt);

    for (let i = 0; i < wallViews.length; i++) {
      const view = wallViews[i];

      if (view) {
        view.t -= dt * 5;
        view.t = Math.max(0, view.t);

        view.ct += dt * 2;

        if (view.ct > 1) {
          view.collisionPoint = null;
        }
      }
    }

    for (let i = 0; i < this._world.circles.length; i++) {
      const circle = this._world.circles[i];

      if (circle.lightT) {
        circle.lightT -= dt * 5;
        circle.lightT = Math.max(0, circle.lightT);
      }
    }

    if (!this._ball.disabled && this._isRoundOver()) {
      this._ball.disabled = true;
      this._ball.x = Infinity;

      setTimeout(() => {
        this._ball.x = SCENE_WIDTH * 0.5;
        this._ball.y = SCENE_HEIGHT * 0.5;
        this._ball.vx = 0;
        this._ball.vy = 0;

        this._ball.disabled = false;
      }, 1000);
    }
  }

  _isRoundOver() {
    return Math.abs(SCENE_HEIGHT * 0.5 - this._ball.y) > SCENE_HEIGHT * 0.6
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  }
}

function drawWalls(g) {
  g.clear();

  for (let i = 0; i < WALLS_CONFIG.length; i++) {
    const config = WALLS_CONFIG[i];

    if (!wallViews[config.id])
      continue;

    const view = wallViews[config.id];
    const color = ColorHelper.lerpHSV(0x4a3da1, 0xf9cdfa, view.t);

    g.lineStyle(config.r * 2, color, 1, CapsStyle.ROUND);
    g.beginPath();
    g.moveTo(
      config.ax,
      config.ay
    )
    g.lineTo(
      config.bx,
      config.by
    );
    g.stroke();

    if (!view.collisionPoint) {
      g.closePath();
      continue;
    }

    const { x, y } = view.collisionPoint;
    const rIn = MathEx.lerp(0, PLAYER_RADIUS * 3, view.ct);
    const rOut = MathEx.lerp(5, PLAYER_RADIUS * 3 + 20, view.ct);

    const gradient = g.createRadialGradient(x, y, rIn, x, y, rOut);

    gradient.addColorStop(0, 0xffffff, 0);
    gradient.addColorStop(0.1, 0xffffff, 1 - view.ct);
    gradient.addColorStop(0.9, 0xffffff, 1 - view.ct);
    gradient.addColorStop(1, 0xffffff, 0);

    g.strokeGradient(gradient);
    g.stroke();
    g.closePath();
  }
}

function createGameFieldMarkings() {
  const g = new Graphics();

  const r = SCENE_WIDTH * 0.25;
  const angleOffset = Math.PI * 0.03;

  g.lineStyle(2, 0xffffff, 0.3, CapsStyle.ROUND);

  g.beginPath();
  g.circle(SCENE_WIDTH * 0.5, SCENE_HEIGHT * 0.5, r);
  g.closePath();
  g.stroke();

  g.beginPath();
  g.moveTo(6, SCENE_HEIGHT * 0.5);
  g.lineTo(SCENE_WIDTH - 6, SCENE_HEIGHT * 0.5);
  g.stroke();
  g.closePath();

  g.beginPath();
  g.arc(SCENE_WIDTH * 0.5, 0, r, angleOffset, Math.PI - angleOffset)
  g.stroke();
  g.closePath();

  g.beginPath();
  g.arc(SCENE_WIDTH * 0.5, SCENE_HEIGHT, r, -angleOffset, Math.PI + angleOffset, true)
  g.stroke();
  g.closePath();

  return g;
}