import { Black, Graphics, DisplayObject, Tween, TextField } from 'black-engine';
import Button from '../../MainMenuScreen/Button';
import BasePopup from './BasePopup';

export default class WaitingOpponentPopup extends BasePopup {
  constructor() {
    super();

    this.touchable = true;

    const text = this._text = new TextField("Waiting for opponent", "Arial", 0xffffff, 60)
    const spinner = this._spinner = new Spinner();
    const cancelBtn = this._cancelBtn = new Button("Cancel", Button.RED, 220, 70)

    this.add(text, spinner, cancelBtn);

    cancelBtn.on("pressed", () => this.post("close"));
    cancelBtn.on("pressed", () => this.post("~cancelGame"));

    this.setSize(590, 370);
  }

  setSize(width, height) {
    super.setSize(width, height);

    const text = this._text;
    const cancelBtn = this._cancelBtn;
    const spinner = this._spinner;

    text.alignAnchor()
    text.x = width * 0.5;
    text.y = text.height * 0.5 + 50;

    cancelBtn.alignAnchor()

    const offsetY = ((height - text.y - text.height * 0.5) - (spinner.height + cancelBtn.height)) / 3;

    spinner.x = width * 0.5;
    spinner.y = text.y + text.height * 0.5 + spinner.height * 0.5 + offsetY;

    cancelBtn.x = width * 0.5;
    cancelBtn.y = height - cancelBtn.height * 0.5 - offsetY;
  }

  get name() {
    return WaitingOpponentPopup.NAME;
  }

  static get NAME() {
    return "WaitingOpponentPopup";
  }
}

const LW = 10;
const RADIUS = 40;

class Spinner extends Graphics {
  constructor() {
    super();

    this._rotateSpeed = 6;

    this.lineStyle(LW, 0xffffff)
    this.beginPath();
    this.arc(RADIUS + LW * 0.5, RADIUS + LW * 0.5, RADIUS, 0, Math.PI * 0.5);
    this.stroke();
    this.closePath();

    this.beginPath();
    this.arc(RADIUS + LW * 0.5, RADIUS + LW * 0.5, RADIUS, Math.PI, Math.PI * 1.5);
    this.stroke();
    this.closePath();

    this.alignAnchor();
  }

  onUpdate() {
    this.rotation += this._rotateSpeed * Black.time.dt;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, RADIUS + LW, RADIUS + LW);
  }
}