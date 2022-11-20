import { Black, Graphics, Emitter, FloatScatter, Modifier, ColorHelper, BlendMode, Timer, MathEx, Vector, Ease, DisplayObject, TextField, CanvasRenderTexture, Sprite, Tween } from 'black-engine';
import GlowingText from '../../../Lib/GlowingText';

export default class CountdownAnimation extends DisplayObject {
  constructor() {
    super();

    this.visible = false;

    const numbers = this._numbers = [
      new GlowingText('3', GLOWING_TEXT_CONFIG.RED),
      new GlowingText('2', GLOWING_TEXT_CONFIG.YELLOW),
      new GlowingText('1', GLOWING_TEXT_CONFIG.GREEN),
      new GlowingText('START', GLOWING_TEXT_CONFIG.PURPLE),
    ]

    this.add(...numbers);
  }

  startCountdown() {
    const numbers = this._numbers;

    this.visible = true;

    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];
      const delay = i * 1;

      number.pivotOffsetX = -20;
      number.pivotOffsetY = -20;

      number.alpha = 0;
      number.scale = 5;

      number.addComponent(new Tween({
        alpha: 1,
      }, 0.5, { delay }));

      number.addComponent(new Tween({
        scale: 1,
      }, 0.4, { delay, ease: Ease.backOut })).once('complete', () => {
        number.addComponent(new Tween({
          alpha: 0,
        }, 0.6, { delay: 0.5 }));

        number.addComponent(new Tween({
          scale: 3,
        }, 0.8, { delay: 0.8 }))
      })
    }
  }
}

const FONT_SIZE = 300;
const STROKE_THICKNESS = 7;

const GLOWING_TEXT_CONFIG = {
  RED: {
    strokeColor: 0xff0000,
    glowColor: 0xff0000,
    strokeThickness: STROKE_THICKNESS,
    fontSize: FONT_SIZE
  },
  YELLOW: {
    strokeColor: 0xffff00,
    glowColor: 0xffff00,
    strokeThickness: STROKE_THICKNESS,
    fontSize: FONT_SIZE
  },
  GREEN: {
    strokeColor: 0x00ff00,
    glowColor: 0x00ff00,
    strokeThickness: STROKE_THICKNESS,
    fontSize: FONT_SIZE
  },
  PURPLE: {
    strokeColor: 0x8c12ff,
    glowColor: 0x8c12ff,
    strokeThickness: 4,
    fontSize: 120
  },
}