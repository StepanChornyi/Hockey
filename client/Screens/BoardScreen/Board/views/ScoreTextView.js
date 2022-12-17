import { DisplayObject, Black, MathEx, Graphics, GraphicsData, Tween, ColorHelper, CapsStyle, Ease, HSV, TextField, FontStyle, Rectangle } from 'black-engine';
import Utils from '../../../../Utils';

export default class ScoreTextView extends DisplayObject {
  constructor(strokeColor = 0xffffff) {
    super();

    const text = this._text = this.addChild(new TextField("0", 'Arial', 0xffffff, 50, FontStyle.ITALIC));

    text.highQuality = true;

    this.alpha = 0;
    text.alpha = 0.3;

    text.textAlpha = 0.9;
    text.strokeThickness = 1;
    text.strokeColor = strokeColor;

    this._score = 0;
  }

  setScore(score, animate = true) {
    if (score === this._score)
      animate = false;

    if (!animate)
      return this._setScore(score);

    const text = this._text

    Utils.removeAllTweens(this);
    Utils.removeAllTweens(text);

    this.addComponent(new Tween({
      alpha: 1,
    }, 0.3)).once('complete', () => {
      text.addComponent(new Tween({
        alpha: 1,
        scale: 1.8
      }, 0.4)).once('complete', () => {
        this._setScore(score);

        text.addComponent(new Tween({
          alpha: 0.3,
          scale: 1
        }, 0.4, { delay: 0.15 }))
      });

      this.addComponent(new Tween({
        alpha: 0,
      }, 0.6, { delay: 0.7 }))
    });
  }

  hightLight() {
    this.addComponent(new Tween({
      alpha: 1,
    }, 0.3)).once('complete', () => {
      this.addComponent(new Tween({
        alpha: 0,
      }, 0.6, { delay: 0.7 }))
    });
  }


  _setScore(score) {
    this._score = score;

    this._text.text = `${score}`;

    const width = (this._text.width / this._text.scaleX);
    const height = (this._text.height / this._text.scaleY);

    this._text.alignAnchor(
      (width * 0.5 - 4) / width,
      (height * 0.5 - 5) / height
    );
  }
}