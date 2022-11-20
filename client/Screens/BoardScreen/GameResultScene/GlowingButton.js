import { Black, CanvasRenderTexture, ColorHelper, FontStyle, Graphics, Sprite, TextField } from "black-engine";
import FitTextComponent from "../../../Fix/FitTextComponent";
import FixedSizeDisplayObject from "../../../Fix/FixedSizeDisplayObject";
import GlowingText from "../../../Lib/GlowingText";

const RADIUS = 5;
const LINE_WIDTH = 2;

export default class GlowingButton extends FixedSizeDisplayObject {
  constructor(text = "Button", buttonStyle, width, height) {
    super();

    const offsetX = 8;
    const offsetY = 5;

    this.touchable = true;

    const glowConfig = {
      strokeColor: buttonStyle.strokeColor,
      glowColor: buttonStyle.glowColor,
      fontSize: 50,
      strokeThickness: 3,
      fontStyle: FontStyle.NORMAL,
    };

    const bg = this._bg = this.addChild(new Graphics());
    const textField = this.addChild(new GlowingText(text, glowConfig));

    // this.addChild(new TextField(text, "Arial", buttonStyle.textFill, 60));

    this._width = textField._textField.width + offsetX * 2;
    this._height = textField._textField.height + offsetY * 2;


    const glowOutline = this._createGlowOutline(this._width, this._height, glowConfig);

    this.addChild(glowOutline);


    this._drawBg({ bgStroke: buttonStyle.bgStroke }, 0.3);

    // textField.align = "center";
    // textField.vAlign = "middle";
    // textField.autoSize = true;

    // textField.fontStyle = 'italic'
    // textField.alignAnchor(0.5, 0.47);
    textField.x = this._width * 0.5;
    textField.y = this._height * 0.5 + 4;


    glowOutline.alignAnchor(0.5)
    glowOutline.x = this._width * 0.5;
    glowOutline.y = this._height * 0.5;


    // textField.addComponent(new FitTextComponent(this._width * 0.9, this._height * 0.9));

    bg.touchable = true;
    bg.isButton = true;

    bg.on("pointerIn", () => this._drawBg(buttonStyle, 0.12));
    bg.on("pointerOut", () => this._drawBg({ bgStroke: buttonStyle.bgStroke }, 0.3));

    this.on("pointerDown", () => this.post("pressed"));
  }

  _drawBg({ bgColor = 0x000000, bgStroke }, bgAlpha = 0) {
    const bg = this._bg;

    bg.clear()
    bg.fillStyle(bgColor, bgAlpha);
    bg.lineStyle(LINE_WIDTH, bgStroke);

    bg.beginPath();
    bg.roundedRect(LINE_WIDTH * 0.5, LINE_WIDTH * 0.5, this._width - LINE_WIDTH, this._height - LINE_WIDTH, RADIUS);
    bg.closePath();
    bg.fill();
    // bg.stroke();
  }

  _createGlowOutline(width, height, { glowColor, strokeColor }) {
    const blur = 10;
    const texture = new CanvasRenderTexture(width + blur * 2, height + blur * 2, 1);
    const ctx = texture.renderTarget.context;

    ctx.save();

    ctx.shadowColor = ColorHelper.intToRGBA(glowColor, 1);
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.lineWidth = LINE_WIDTH + 1;
    ctx.strokeStyle = ColorHelper.intToRGBA(strokeColor);

    ctx.beginPath();
    roundedRect(ctx, blur, blur, width, height, RADIUS);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    ctx.lineWidth = 1;
    ctx.strokeStyle = ColorHelper.intToRGBA(0xffffff);

    ctx.beginPath();
    roundedRect(ctx, blur, blur, width, height, RADIUS);
    ctx.closePath();
    ctx.stroke();

    return new Sprite(texture);
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._width, this._height);
  }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

// Button.BLUE = {
//   bgColor: 0x3da2d9,
//   bgStroke: 0x3da2d9,
//   lineWidth: 2,
//   textFill: 0x3da2d9,
// };

// Button.GREEN = {
//   bgColor: 0x3dd964,
//   bgStroke: 0x3dd964,
//   lineWidth: 2,
//   textFill: 0x3dd964,
// };

// Button.YELLOW = {
//   bgColor: 0xd9c73d,
//   bgStroke: 0xd9c73d,
//   lineWidth: 2,
//   textFill: 0xd9c73d,
// };

// Button.WHITE_GREEN = {
//   bgColor: 0x3dd964,
//   bgStroke: 0x3dd964,
//   lineWidth: 2,
//   textFill: 0xffffff,
// };