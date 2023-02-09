import { Black, Graphics, DisplayObject, Tween, TextField, Rectangle } from 'black-engine';
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
const SEGMENTS_COUNT = 2;

class Spinner extends Graphics {
  constructor() {
    super();

    this._rotateSpeed = 6;

    this.lineStyle(LW, 0xffffff)

    const angularSize = (Math.PI * 2) / (SEGMENTS_COUNT * 2);

    for (let i = 0; i < SEGMENTS_COUNT; i++) {
      this.beginPath();
      this.arc(RADIUS + LW * 0.5, RADIUS + LW * 0.5, RADIUS, angularSize * (i * 2), angularSize * (i * 2 + 1));
      this.stroke();
      this.closePath();
    }

    this.alignAnchor();
  }

  onUpdate() {
    this.rotation += this._rotateSpeed * Black.time.dt;
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, RADIUS*2 + LW, RADIUS*2 + LW);
  }

  onGetLocalBounds(outRect = new Rectangle()) {
    return this._getFixedBounds(outRect);
  }

  get bounds() {
    return this.getBounds();
  }

  getBounds(...args) {
    return super.getBounds(args[0], false, args[2]);
  }
}