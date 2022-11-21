import { Black, Graphics, DisplayObject, Tween, Ease } from 'black-engine';

export default class BasePopup extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    const bg = this._bg = this.addChild(new Graphics());

    bg.touchable = true;

    this._width = 10;
    this._height = 10;
  }

  show() {
    this.alpha = 0;
    this.scale = 0;

    this.addComponent(new Tween({
      alpha: 1,
    }, 0.2));

    return this.addComponent(new Tween({
      scale: 1,
    }, 0.3, { ease: Ease.backOut }));
  }

  hide() {
    this.addComponent(new Tween({
      alpha: 0,
    }, 0.2, { delay: 0.1 }));

    return this.addComponent(new Tween({
      scale: 0,
    }, 0.3, { ease: Ease.backIn }));
  }

  setSize(width, height) {
    this._width = width;
    this._height = height;

    const bg = this._bg;

    bg.clear();

    bg.lineStyle(2, 0x4a3da1)
    bg.fillStyle(0x000000, 0.5);
    bg.beginPath();
    bg.roundedRect(0, 0, width, height, 7);
    bg.closePath();
    bg.fill();
    bg.stroke();

    this.alignPivotOffset();
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._width, this._height);
  }
}
