import { Black, Graphics, TextField } from "black-engine";
import FitTextComponent from "../../Fix/FitTextComponent";
import FixedSizeDisplayObject from "../../Fix/FixedSizeDisplayObject";

const RADIUS = 5;
const LINE_WIDTH = 2;

export default class Button extends FixedSizeDisplayObject {
  constructor(text = "Button", buttonStyle, width, height) {
    super();

    this._width = width;
    this._height = height;

    this.touchable = true;

    const bg = this._bg = this.addChild(new Graphics());
    const textField = this.addChild(new TextField(text, "Arial", buttonStyle.textFill, 60));

    this._drawBg({ bgStroke: buttonStyle.bgStroke }, 0.3);

    textField.align = "center";
    textField.vAlign = "middle";
    textField.autoSize = true;

    textField.alignAnchor(0.5, 0.47);
    textField.x = bg.width * 0.5;
    textField.y = bg.height * 0.5;

    textField.addComponent(new FitTextComponent(this._width * 0.9, this._height * 0.9));

    bg.touchable = true;
    bg.isButton = true;

    bg.on("pointerIn", () => this._drawBg(buttonStyle, 0.12));
    bg.on("pointerOut", () => this._drawBg({ bgStroke: buttonStyle.bgStroke }, 0.3));

    this.on("pointerDown", () => {
      Black.audio.play("click", "master", 0.5);
      this.post("pressed");
    });
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
    bg.stroke();
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._width, this._height);
  }
}

Button.BLUE = {
  bgColor: 0x3da2d9,
  bgStroke: 0x3da2d9,
  lineWidth: 2,
  textFill: 0x3da2d9,
};

Button.GREEN = {
  bgColor: 0x3dd964,
  bgStroke: 0x3dd964,
  lineWidth: 2,
  textFill: 0x3dd964,
};

Button.YELLOW = {
  bgColor: 0xd9c73d,
  bgStroke: 0xd9c73d,
  lineWidth: 2,
  textFill: 0xd9c73d,
};

Button.WHITE_GREEN = {
  strokeColor: 0x58e83f,
  glowColor: 0x00ff00,
  bgColor: 0x3dd964,
  bgStroke: 0x3dd964,
  lineWidth: 2,
  textFill: 0xffffff,
};

Button.WHITE_RED = {
  strokeColor: 0xe61919,
  glowColor: 0xff0000,
  bgColor: 0xd93d3d,
  bgStroke: 0xd93d61,
  lineWidth: 2,
  textFill: 0xffffff,
};