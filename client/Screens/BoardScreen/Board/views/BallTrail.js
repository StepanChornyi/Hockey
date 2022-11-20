import { Vector, CanvasRenderTexture, ColorHelper, Emitter, FloatScatter, Modifier, BlendMode, DisplayObject, Black, MathEx, Sprite } from 'black-engine';
import { BALL_RADIUS, BOARD_HEIGHT, BOARD_WIDTH } from '../BoardConfig';

const EFFECT_WIDTH = BOARD_WIDTH;
const EFFECT_HEIGHT = BOARD_HEIGHT + BALL_RADIUS * 4;
const OFFSET_X = 0
const OFFSET_Y = -BALL_RADIUS * 2;

export default class BallTrail extends DisplayObject {
  constructor() {
    super();

    const texture = new CanvasRenderTexture(EFFECT_WIDTH, EFFECT_HEIGHT, 1);
    const view = this.addChild(new Sprite(texture));

    view.x = OFFSET_X;
    view.y = OFFSET_Y;

    this._trailTexture = texture;
    this._tmpTexture = new CanvasRenderTexture(EFFECT_WIDTH, EFFECT_HEIGHT, 0.6);
    this._prevPos = new Vector();
    this._resetPos = true;
    this._fadeFactor = 0.8;
  }

  onUpdate() {
    this.clearTrail();
  }

  drawTrail(currentPos) {
    if (this._resetPos) {
      this._prevPos.copyFrom(currentPos);
      this._resetPos = false;
      return;
    }

    if (this._prevPos.equals(currentPos))
      return;

    const ctx = this._trailTexture.renderTarget.context;

    ctx.strokeStyle = ColorHelper.intToRGBA(0x0c7ef7, 0.6);
    ctx.lineWidth = BALL_RADIUS * 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-OFFSET_X + this._prevPos.x, -OFFSET_Y + this._prevPos.y);
    ctx.lineTo(-OFFSET_X + currentPos.x, -OFFSET_Y + currentPos.y);
    ctx.stroke();
    ctx.closePath();

    this._prevPos.copyFrom(currentPos);
  }

  clearTrail() {
    const canvas = this._trailTexture.native;
    const ctx = this._trailTexture.renderTarget.context;

    const tmpCanvas = this._tmpTexture.native;
    const tmpCtx = this._tmpTexture.renderTarget.context;

    tmpCtx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
    tmpCtx.globalAlpha = this._fadeFactor;
    tmpCtx.drawImage(canvas, 0, 0, tmpCanvas.width, tmpCanvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);
  }

  resetPos() {
    this._resetPos = true;
  }
}