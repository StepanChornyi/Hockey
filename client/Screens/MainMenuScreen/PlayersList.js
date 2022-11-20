import { Black, DisplayObject, Graphics, TextField } from "black-engine";

export default class PlayersList extends DisplayObject {
  constructor() {
    super();

    this.touchable = true;

    this._textFields = [];
    this._pool = [];
  }

  setPlayers(players) {
    while (this._textFields.length > players.length) {
      this._removeTextField(this._textFields.pop());
    }

    for (let i = 0; i < players.length; i++) {
      if (this._textFields[i]) {
        this._textFields[i].text = `${players[i].name}`;
      } else {
        const text = this._createText();

        text.text = `${players[i].name}`;

        this._textFields.push(text);
      }
    }

    this._alignItems();
  }

  _alignItems() {
    for (let i = 0; i < this._textFields.length; i++) {
      const element = this._textFields[i];

      element.x = 10;
      element.y = -30 * i - 10;
    }
  }

  _createText() {
    const textField = this._pool.pop() || new TextField("", "Arial", 0x999999, 20);

    textField.alignAnchor(0, 1);

    this.addChild(textField);

    return textField;
  }

  _removeTextField(textField) {
    this.removeChild(textField);

    this._pool.push(textField);
  }
}



