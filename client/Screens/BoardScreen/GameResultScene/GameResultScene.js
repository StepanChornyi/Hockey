import { Black, Graphics, Emitter, FloatScatter, Modifier, ColorHelper, BlendMode, Timer, MathEx, Vector, Ease, DisplayObject, TextField, CanvasRenderTexture, Sprite, Tween, Rectangle } from 'black-engine';
import BaseScene from '../../../Lib/BaseScene';
import Button from '../../MainMenuScreen/Button';
import GlowingButton from './GlowingButton';
import WinLoseAnimation from './WinLoseAnimation';

export default class GameResultScene extends BaseScene {
  constructor() {
    super();

    this.touchable = true;

    this.visible = false;
    this._resizeBounds = new Rectangle();

    const wlAnimContainer = this._wlAnimContainer = new DisplayObject();
    const continueBtnGreen = this._continueBtnGreen = new GlowingButton("Continue", Button.WHITE_GREEN, 250, 80);
    const continueBtnRed = this._continueBtnRed = new GlowingButton("Continue", Button.WHITE_RED, 250, 80);

    this._wlAnim = wlAnimContainer.addChild(new WinLoseAnimation());

    continueBtnGreen.visible = false;
    continueBtnGreen.on('pressed', () => this.post("continuePressed"));

    continueBtnRed.visible = false;
    continueBtnRed.on('pressed', () => this.post("continuePressed"));

    this.add(wlAnimContainer, continueBtnGreen, continueBtnRed);
  }

  showWin() {
    this.visible = true;
    this.onResize(this._resizeBounds);

    this._showOverlay();

    const wlAnim = this._wlAnim;

    wlAnim.playWin();

    this.addComponent(new Timer(2))
      .on('complete', () => {
        wlAnim.addComponent(new Tween({
          y: -100,
        }, 0.5, {
          ease: Ease.backInOut
        }));

        this._showContinueBtn(this._continueBtnGreen, 0.5);
      });
  }

  showLose() {
    this.visible = true;
    this.onResize(this._resizeBounds);

    this._showOverlay();

    const wlAnim = this._wlAnim;

    wlAnim.playLose();

    this.addComponent(new Timer(2))
      .on('complete', () => {
        wlAnim.addComponent(new Tween({
          y: -100,
        }, 0.5, {
          ease: Ease.backInOut
        }));

        this._showContinueBtn(this._continueBtnRed, 0.5);
      });
  }

  hide() {
    this.visible = false;
    this._wlAnim.hide();
    this._overlay.alpha = 0;
  }

  _showContinueBtn(continueBtn, delay = 0) {
    continueBtn.visible = true;
    continueBtn.scale = 2;
    continueBtn.alpha = 0;

    continueBtn.addComponent(new Tween({
      scale: 1,
    }, 0.6, {
      delay,
      ease: Ease.backOut
    })).once('complete', () => {
      continueBtn.addComponent(new Tween({
        scale: 1.1,
      }, 0.4, {
        ease: Ease.sinusoidalInOut,
        repeats: 3,
        yoyo: true
      }))
    })

    continueBtn.addComponent(new Tween({
      alpha: 1,
    }, 0.1, { delay }));
  }

  onResize(bounds) {
    super.onResize(bounds);

    const wlAnimContainer = this._wlAnimContainer;
    const continueBtnGreen = this._continueBtnGreen;
    const continueBtnRed = this._continueBtnRed;

    wlAnimContainer.x = bounds.center().x;
    wlAnimContainer.y = bounds.center().y;

    continueBtnGreen.alignAnchor(0.5);
    continueBtnRed.alignAnchor(0.5);
    continueBtnGreen.x = continueBtnRed.x = bounds.center().x;
    continueBtnGreen.y = continueBtnRed.y = bounds.center().y + 100;

    this._resizeBounds.copyFrom(bounds);
  }
}
