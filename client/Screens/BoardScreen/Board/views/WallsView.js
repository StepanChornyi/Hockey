import { Black, Graphics, CapsStyle, ColorHelper, GraphicsLinearGradient, Timer, MathEx, Vector, RGB, DisplayObject, Debug, GameObject } from 'black-engine';
import { PLAYER_RADIUS, WALLS_CONFIG } from './../BoardConfig';

const DEFAULT_LIGHT_COLOR = 0xf9cdfa;

export default class WallsView extends DisplayObject {
  constructor() {
    super();

    for (let i = 0; i < WALLS_CONFIG.length; i++) {
      const config = WALLS_CONFIG[i];

      if (config.visible) {
        this.add(new WallView(config));
      }
    }
  }

  showEffect(id, collisionPoint = null, shineStrength = 1) {
    const wallView = GameObject.findById(id, this);

    if (!wallView)
      return;

    wallView.t = shineStrength;
    wallView.collisionPoint = collisionPoint;
    wallView.ct = 0;
    wallView.lightColor = DEFAULT_LIGHT_COLOR;
  }
}

class WallView extends Graphics {
  constructor({ id, ax, ay, bx, by, r }) {
    super();

    this.mId = id;

    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
    this.r = r;

    this.t = 0;
    this.collisionPoint = 0;
    this.ct = 0;
  }

  onUpdate() {
    const dt = Black.time.delta;

    if (this.t) {
      this.t -= dt * 5;
      this.t = Math.max(0, this.t);
    }

    if (this.collisionPoint) {
      this.ct += dt * 2;

      if (this.ct > 1) {
        this.collisionPoint = null;
      }
    }
  }

  onRender() {
    const g = this;
    const color = ColorHelper.lerpHSV(0x4a3da1, 0xf9cdfa, this.t);

    g.clear();

    g.lineStyle(this.r * 2, color, 1, CapsStyle.ROUND);
    g.beginPath();
    g.moveTo(
      this.ax,
      this.ay
    )
    g.lineTo(
      this.bx,
      this.by
    );
    g.stroke();

    if (!this.collisionPoint) {
      g.closePath();
      return;
    }

    const { x, y } = this.collisionPoint;
    const rIn = MathEx.lerp(0, PLAYER_RADIUS * 3, this.ct);
    const rOut = MathEx.lerp(5, PLAYER_RADIUS * 3 + 20, this.ct);

    const gradient = g.createRadialGradient(x, y, rIn, x, y, rOut);

    gradient.addColorStop(0, 0xffffff, 0);
    gradient.addColorStop(0.1, 0xffffff, 1 - this.ct);
    gradient.addColorStop(0.9, 0xffffff, 1 - this.ct);
    gradient.addColorStop(1, 0xffffff, 0);

    g.strokeGradient(gradient);
    g.stroke();
    g.closePath();
  }
}

