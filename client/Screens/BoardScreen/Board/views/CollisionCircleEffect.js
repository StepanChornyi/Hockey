import { Vector, DisplayObject, Black, Graphics, Tween, Ease } from 'black-engine';
import Utils from '../../../../Utils';

const MAX_EFFECTS_COUNT = 5;

export default class CollisionCircleEffect extends DisplayObject {
  constructor() {
    super();

    this._pool = [];
    this._pool = [];
    this._tmpVec = new Vector();
  }

  show({ x, y }, radius = 5, color) {
    if (this.numChildren === MAX_EFFECTS_COUNT) {
      this._pool.push(this.removeChildAt(0));
    }

    const circle = this.addChild(this._pool.pop() || new AnimatedCircle());

    circle.reset(radius, color);

    circle.x = x;
    circle.y = y;

    circle.animate().once("complete", () => {
      this.removeChild(circle);

      this._pool.push(circle);
    });
  }
}

class AnimatedCircle extends Graphics {
  constructor() {
    super();

    this.reset();
  }

  reset(radius = 5, color = 0x7abbff) {
    this.alpha = 1;
    this.scale = 1;

    this.clear();
    this.beginPath();
    this.lineStyle(0.7, color, 0.9);
    this.circle(0, 0, radius);
    this.closePath();
    this.stroke();

    Utils.removeAllTweens(this);
  }

  animate() {
    this.addComponent(new Tween({ scale: 4 }, 0.45, { ease: Ease.cubicOut }));

    return this.addComponent(new Tween({ alpha: 0 }, 0.45, { ease: Ease.cubicOut }));
  }
}
