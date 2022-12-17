import { Vector, DisplayObject, Black, Graphics, Tween, Ease } from 'black-engine';
import Utils from '../../../../Utils';

export default class ClickEffect extends DisplayObject {
  constructor() {
    super();

    this._pool = [];
    this._tmpVec = new Vector();
  }

  onClick() {
    this.parent.globalToLocal(Black.input.pointerPosition, this._tmpVec);

    this.show(this._tmpVec);
  }

  show({ x, y }) {
    const circle = this.addChild(this._pool.pop() || new AnimatedCircle());

    circle.x = x;
    circle.y = y;

    circle.animate().once("complete", () => {
      this.removeChild(circle);

      circle.reset();

      this._pool.push(circle);
    });
  }
}

class AnimatedCircle extends Graphics {
  constructor() {
    super();

    this.beginPath();
    this.lineStyle(0.3, 0xffffff, 0.9);
    this.circle(0, 0, 10);
    this.closePath();
    this.stroke();
  }

  reset() {
    this.alpha = 1;
    this.scale = 1;

    Utils.removeAllTweens(this);
  }

  animate() {
    this.addComponent(new Tween({ scale: 4 }, 1, { ease: Ease.cubicOut }));

    return this.addComponent(new Tween({ alpha: 0 }, 1, { ease: Ease.cubicOut }));
  }
}
