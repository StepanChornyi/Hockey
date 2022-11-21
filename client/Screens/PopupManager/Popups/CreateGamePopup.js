import { Black, Graphics, DisplayObject, Tween, TextField } from 'black-engine';
import Button from '../../MainMenuScreen/Button';
import BasePopup from './BasePopup';

export default class CreateGamePopup extends BasePopup {
  constructor() {
    super();

    this.touchable = true;

    const text = this._text = new TextField("Create new game?", "Arial", 0xffffff, 65)
    const cancelBtn = this._cancelBtn = new Button("Cancel", Button.RED, 220, 70)
    const confirmBtn = this._confirmBtn = new Button("Create", Button.GREEN, 220, 70)

    this.add(text, cancelBtn, confirmBtn);

    cancelBtn.on("pressed", () => this.post("close"));
    confirmBtn.on("pressed", () => this.post("~createGame"));

    this.setSize(590, 370);
  }

  setSize(width, height) {
    super.setSize(width, height);

    const text = this._text;
    const cancelBtn = this._cancelBtn;
    const confirmBtn = this._confirmBtn;

    text.alignAnchor()
    text.x = width * 0.5;
    text.y = text.height * 0.5 + 80;

    cancelBtn.alignAnchor()
    confirmBtn.alignAnchor()

    const offsetX = (width - cancelBtn.width - confirmBtn.width) / 3;

    cancelBtn.x = width * 0.5 - cancelBtn.width * 0.5 - offsetX * 0.5;
    confirmBtn.x = width * 0.5 + confirmBtn.width * 0.5 + offsetX * 0.5;

    cancelBtn.y = confirmBtn.y = (height + text.y + text.height * 0.5) * 0.5;
  }

  get name() {
    return CreateGamePopup.NAME;
  }

  static get NAME() {
    return "CreateGamePopup";
  }
}
