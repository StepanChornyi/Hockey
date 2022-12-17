import { Black, Graphics, CapsStyle, ColorHelper, GraphicsLinearGradient, Timer, MathEx, Vector, RGB, DisplayObject } from 'black-engine';
import { PLAYER_RADIUS } from './../BoardConfig';

export default class PlayerView extends Graphics {
  constructor({
    x = 0,
    y = 0,
    radius = PLAYER_RADIUS,
    color = 0x3d64e3,
    lightColor = 0xffffff,
    lightT = 0,
    strokeAlpha = 0,
    hitNormal = null
  } = {}) {
    super();

    this.position = new Vector(x, y);
    this.radius = radius;

    this._color = color;
    this.lightColor = lightColor;
    this.lightT = lightT;
    this.strokeAlpha = strokeAlpha;
    this.hitNormal = hitNormal;
  }

  onUpdate() {
    const dt = Black.time.delta;

    if (this.lightT) {
      this.lightT -= dt * 4;
      this.lightT = Math.max(0, this.lightT);
    }

    if (this.strokeAlpha) {
      this.strokeAlpha -= dt * 3;
      this.strokeAlpha = Math.max(0, this.strokeAlpha);
    }
  }

  onRender() {

    const { x, y } = this.position;
    const radius = this.radius;
    const lineWidth = radius * 0.45;
    const color = ColorHelper.lerpRGB(this._color, this.lightColor, this.lightT * 0.7);
    const g = this;

    g.clear();

    g.lineStyle(lineWidth, color, 0.7);
    g.beginPath();
    g.circle(
      x,
      y,
      radius - lineWidth * 0.5,
    );
    g.closePath();
    g.stroke();

    g.lineStyle(lineWidth - 1, color, 1);
    g.beginPath();
    g.circle(
      x,
      y,
      radius - lineWidth * 0.5
    );
    g.closePath();
    g.stroke();

    if (this.strokeAlpha) {
      let t = 1 - this.strokeAlpha;

      const offset = radius * (0.8 + t * 0.2);
      const xx = x + offset * this.hitNormal.x;
      const yy = y + offset * this.hitNormal.y;

      const rIn = MathEx.lerp(0, radius * 2, t);
      const rOut = MathEx.lerp(0, radius * 2 + 20, t);

      const gradient = g.createRadialGradient(xx, yy, rIn, xx, yy, rOut);

      gradient.addColorStop(0, 0xffffff, 0);
      gradient.addColorStop(0.1, 0xffffff, 0.8);
      gradient.addColorStop(0.9, 0xffffff, 0.8);
      gradient.addColorStop(1, 0xffffff, 0);

      g.lineStyle(lineWidth - 1, 0x000000, 1);
      g.strokeGradient(gradient);
      g.beginPath();
      g.circle(
        x,
        y,
        radius - lineWidth * 0.5
      );
      g.closePath();
      g.stroke();
    }
  }

  get color() {
    return this._color;
  }
}