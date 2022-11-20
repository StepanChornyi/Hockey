import { Black, Graphics, CapsStyle, ColorHelper, GraphicsLinearGradient, Timer, MathEx, Vector, RGB, DisplayObject, Debug } from 'black-engine';
import { BALL_RADIUS } from '../BoardConfig';

export default class BallView extends Graphics {
  constructor() {
    super();

    this.lineStyle(1, 0x0c7ef7, 0.8);
    this.fillStyle(0xffffff);
    this.beginPath();
    this.circle(
      0,
      0,
      BALL_RADIUS,
    );
    this.closePath();
    this.fill();
    this.stroke();
  }
}