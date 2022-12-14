import { Black, Graphics, Emitter, FloatScatter, Modifier, ColorHelper, BlendMode, Timer, MathEx, Vector, Ease, DisplayObject, TextField, CanvasRenderTexture, Sprite, Tween } from 'black-engine';
import BaseScene from '../../../Lib/BaseScene';
import CountdownAnimation from './CountdownAnimation';

export default class CountdownScene extends BaseScene {
  constructor() {
    super();

    this.touchable = true;

    this._countdownAnim = this.addChild(new CountdownAnimation());

    this._overlay.alpha = 0;
  }

  show() {
    this._showOverlay(0.5).once("complete", () => {
      this._hideOverlay(2.5);
    });

    return this._countdownAnim.startCountdown();
  }

  hide() {

  }

  onResize(bounds) {
    super.onResize(bounds);

    const countdownAnim = this._countdownAnim;

    // const wlAnimContainer = this._wlAnimContainer;
    // const continueBtnGreen = this._continueBtnGreen;
    // const continueBtnRed = this._continueBtnRed;

    countdownAnim.x = bounds.center().x;
    countdownAnim.y = bounds.center().y;

    // continueBtnGreen.alignAnchor(0.5);
    // continueBtnRed.alignAnchor(0.5);
    // continueBtnGreen.x = continueBtnRed.x = bounds.center().x;
    // continueBtnGreen.y = continueBtnRed.y = bounds.center().y + 100;
  }
}
