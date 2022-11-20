import { Black, Graphics, DisplayObject, Tween } from 'black-engine';

export default class BaseScene extends DisplayObject {
  constructor() {
    super();

    const overlay = this._overlay = this._createOverlay();

    overlay.alpha = 0;

    this.add(overlay);
  }

  onResize(bounds) {
    const overlay = this._overlay;

    overlay.x = bounds.left;
    overlay.y = bounds.top;
    overlay.width = bounds.width;
    overlay.height = bounds.height;
  }

  _showOverlay(alpha = 0.4) {
    this._overlay.alpha = 0;

    return this._overlay.addComponent(new Tween({
      alpha,
    }, 0.4));
  }

  _hideOverlay(delay = 0.2) {
    return this._overlay.addComponent(new Tween({
      alpha: 0,
    }, 0.4, { delay }));
  }

  _createOverlay() {
    const g = new Graphics();

    g.fillStyle(0x000000, 1);
    g.beginPath();
    g.rect(0, 0, 10, 10);
    g.closePath();
    g.fill();

    return g;
  }
}
