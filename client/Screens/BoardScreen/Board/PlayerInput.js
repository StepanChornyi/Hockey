import { Black, Graphics, Vector } from 'black-engine';
import Utils from '../../../Utils';

export default class PlayerInput extends Graphics {
  constructor(rect) {
    super();

    this._rect = rect;

    this.alpha = 0//0.3;

    this.touchable = true;

    this.x = rect.x;
    this.y = rect.y;

    this.lineStyle(1, 0xffffff, 0.3)
    this.fillStyle(0xffffff, 0.1);
    this.beginPath();
    this.rect(0, 0, rect.width, rect.height);
    this.closePath();
    this.stroke();
    this.fill();

    this._pos = new Vector();
    this._tmp = new Vector();
    this._isPressed = false;
    this._pointerId = -1;
    this._interpolationFactor = 0;

    this.on("pointerDown", (_, pointer) => {
      this._pointerId = pointer.id;
      this._isPressed = true;

      this.calcPos();

      const distance = this._tmp.distance(this._pos);

      this._interpolationFactor = Math.min(1, Math.max(0, 30 / distance));

      this.updatePosition();
    });

    this.on("pointerUp", (_, pointer) => {
      if (pointer.id !== this._pointerId)
        return;

      this._isPressed = false;
      this._pointerId = -1;
    });
  }

  onUpdate() {
    if (this._isPressed) {
      this._interpolationFactor = Math.min(1, this._interpolationFactor / 0.8);
    } else {
      this._interpolationFactor = 1;
    }
  }

  updatePosition() {
    if (!this._isPressed)
      return;

    this.calcPos();

    Utils.lerpVector(this._pos, this._tmp, 1);
  }

  calcPos() {
    this.parent.globalToLocal(Black.input.pointerPosition, this._tmp);
  }

  get inputPos() {
    this.updatePosition();

    return this._pos;
  }

  set inputPos(val) {
    this._pos.copyFrom(val);
    this._tmp.copyFrom(val);
  }
}