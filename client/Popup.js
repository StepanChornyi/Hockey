import { AssetManager, Black, Ease, GameObject, Graphics, MessageDispatcher, TextField, Tween } from 'black-engine';
import Utils from './Utils';
import FixedSizeDisplayObject from './Fix/FixedSizeDisplayObject';

export default class PopupWrapper extends FixedSizeDisplayObject {
  constructor() {
    super();

    this._init();

    this.hide(true);
  }

  show(textStr) {
    const popup = this._popup;

    this.visible = true;

    Utils.removeAllTweens(this, popup);

    this.addComponent(new Tween({ alpha: 1 }, 0.15));

    popup.setText(textStr);

    return popup.show();
    ;
  }

  hide(instantly = false) {
    const popup = this._popup;

    Utils.removeAllTweens(this, popup);

    if (instantly) {
      this.alpha = 0;

      popup.hide(instantly);

      return;
    }

    popup.hide();

    const completeDispatcher = this.addComponent(new Tween({ alpha: 0 }, 0.3, {
      delay: 0.3
    }));

    completeDispatcher.on("complete", () => this.visible = false);

    return completeDispatcher;
  }

  resize(width, height) {
    const overlay = this._overlay;
    const popup = this._popup;

    overlay.width = width;
    overlay.height = height;

    popup.resize(width, 200);
    popup.alignAnchor();
    popup.x = width * 0.5;
    popup.y = height * 0.5;

    this._width = width;
    this._height = height;
  }

  _init() {
    const overlay = this._overlay = this._createOverlay();
    const popup = this._popup = new Popup();

    this.touchable = true;
    overlay.touchable = true;

    this.add(overlay, popup);
  }

  _createOverlay() {
    const overlay = new Graphics();

    overlay.fillStyle(0x000000, 0.6);
    overlay.beginPath();
    overlay.rect(0, 0, 10, 10);
    overlay.closePath();
    overlay.fill();

    return overlay;
  }
}

class Popup extends FixedSizeDisplayObject {
  constructor() {
    super();

    this._width = 0;
    this._height = 0;

    this._init();
  }

  setText(str) {
    this._textField.text = str;
  }

  show() {
    const bg = this._bg;
    const textField = this._textField;

    Utils.removeAllTweens(bg, textField);

    bg.addComponent(new Tween({ alpha: 1, scaleY: 1 }, 0.2, {
      ease: Ease.backOut
    }));

    return textField.addComponent(new Tween({ alpha: 1, scale: 1 }, 0.2, {
      delay: 0.1,
      ease: Ease.backOut
    }));
  }

  hide(instantly = false) {
    const textField = this._textField;
    const bg = this._bg;

    Utils.removeAllTweens(bg, textField);

    if (instantly) {
      bg.alpha = 0;
      bg.scaleY = 0;

      textField.alpha = 0;
      textField.scale = 0.8;

      return;
    }

    bg.addComponent(new Tween({ alpha: 0, scaleY: 0 }, 0.2, {
      ease: Ease.backIn,
      delay: 0.1
    }));

    return textField.addComponent(new Tween({ alpha: 0, scale: 0.8 }, 0.3, {
      ease: Ease.backIn
    }));
  }

  resize(width, height) {
    const textField = this._textField;
    const bg = this._bg;

    this._width = width;
    this._height = height;

    this._updateBg();

    textField.alignAnchor(0.5, 0.47);
    textField.x = width * 0.5;
    textField.y = height * 0.5;

    bg.alignAnchor(0.5);
    bg.x = width * 0.5;
    bg.y = height * 0.5;
  }

  _init() {
    const bg = this._bg = new Graphics();
    const textField = this._textField = new TextField("", "Arial", 0xeeeeee);

    textField.text = "HELLO WORLD";
    textField.size = 60;

    this.add(bg, textField);
  }

  _updateBg() {
    const bg = this._bg;
    const width = this._width;
    const height = this._height;

    bg.clear();

    bg.fillStyle(0x151515, 1);
    bg.beginPath();
    bg.rect(0, 0, width, height);
    bg.closePath();
    bg.fill();

    bg.lineStyle(2, 0x4a3da1);

    bg.beginPath();
    bg.moveTo(0, 0);
    bg.lineTo(width, 0);
    bg.stroke();
    bg.closePath();

    bg.beginPath();
    bg.moveTo(0, height);
    bg.lineTo(width, height);
    bg.stroke();
    bg.closePath();
  }

  _getFixedBounds(outRect) {
    return outRect.set(0, 0, this._width, this._height);
  }
}