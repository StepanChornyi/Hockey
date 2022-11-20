import { Black, Graphics, TextField, TextStyle } from "black-engine";
import FitTextComponent from "../../Fix/FitTextComponent";
import FixedSizeDisplayObject from "../../Fix/FixedSizeDisplayObject";
import Button from "./Button";

const RADIUS = 5;
const WIDTH = 640;
const HEIGHT = 50;

export default class ListItem extends FixedSizeDisplayObject {
  constructor() {
    super();

    this.touchable = true;

    const bg = this.addChild(this._createBg());
    const textField = this._textField = this.addChild(new TextField("HELLO WORLD!", "Arial", 0xeeeeee, 20));
    const joinBtn = this._joinBtn = this.addChild(new Button("Join", Button.YELLOW, 70, 35));

    joinBtn.on('pressed', () => this.post("joinPressed"));


    const redTextStyle = new TextStyle("Arial");

    redTextStyle.color = 0xd93d8b;
    redTextStyle.size = textField.size;

    textField.setStyle("red", redTextStyle);
    

    // textField.addComponent(new FitTextComponent(WIDTH * 0.9, HEIGHT * 0.9));

    // textField.highQuality = true;

    bg.touchable = true;

    this._alignElements();
  }

  setData({ playerA, playerB, isWaiting }) {
    const textField = this._textField;
    const joinBtn = this._joinBtn;

    if (isWaiting) {
      textField.text = `~{red}${playerA}~{def} is waiting for opponent`;
      joinBtn.visible = true;
    } else {
      textField.text = `~{red}${playerA}~{def} is playing vs ~{red}${playerB}~{def}`;
      joinBtn.visible = false;
    }

    this._alignElements();
  }

  _alignElements() {
    const textField = this._textField;
    const joinBtn = this._joinBtn;

    textField.align = "center";
    textField.vAlign = "middle";
    textField.autoSize = true;

    textField.alignAnchor(0, 0.45);
    textField.x = 10;
    textField.y = HEIGHT * 0.5;

    joinBtn.alignAnchor(1, 0.5);
    joinBtn.x = WIDTH - 10;
    joinBtn.y = HEIGHT * 0.5;
  }

  _createBg() {
    const bg = new Graphics();

    bg.fillStyle(0x000000, 0);
    bg.lineStyle(2, 0x4a3da1, 0.8);

    bg.beginPath();
    bg.rect(0, 0, WIDTH, HEIGHT)
    bg.closePath();
    bg.fill();

    bg.beginPath();
    bg.moveTo(0, HEIGHT - 1)
    bg.lineTo(WIDTH, HEIGHT - 1)
    bg.stroke();
    bg.closePath();

    return bg;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, WIDTH, HEIGHT);
  }
}