import { GameObject, Black, Sprite, Graphics, GraphicsLinearGradient, ColorHelper, DisplayObject, Tween, Ease } from 'black-engine';

export default class TransitionOverlay extends DisplayObject {
  constructor() {
    super();

    this._overlay = this.addChild(this._createOverlay());

    this.visible = false;

    Black.stage.on("resize", this._resizeOverlay.bind(this)).callback();
  }

  showTransition(transitionClb = ()=>{}) {
    this.visible = true;
    this.alpha = 0;

    this.addComponent(new Tween({
      alpha: 1,
    }, 0.3, {
      ease: Ease.sinusoidalInOut
    })).once('complete', () => {
      transitionClb();

      this.addComponent(new Tween({
        alpha: 0,
      }, 0.3, {
        ease: Ease.sinusoidalInOut
      }))
    })

  }

  _resizeOverlay() {
    const stage = Black.stage;
    const stageBounds = stage.getBounds();

    const overlay = this._overlay;

    overlay.x = stageBounds.left;
    overlay.y = stageBounds.top;
    overlay.width = stageBounds.width;
    overlay.height = stageBounds.height;
  }

  _createOverlay() {
    const g = new Graphics();

    g.fillStyle(0x000000);
    g.beginPath();
    g.rect(0, 0, 100, 100)
    g.closePath();
    g.fill();

    return g;
  }
}