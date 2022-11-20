import { Component } from "black-engine";

export default class FitTextComponent extends Component {
  constructor(maxWidth = 100, maxHeight = 100, maxScale = 1) {
    super();

    this._maxWidth = maxWidth;
    this._maxHeight = maxHeight;
    this._maxScale = maxScale;
  }

  onAdded() {
    this.onChange();
  }

  onChange(maxWidth = this._maxWidth, maxHeight = this._maxHeight, maxScale = this._maxScale) {
    this._maxWidth = maxWidth;
    this._maxHeight = maxHeight;
    this._maxScale = maxScale;

    if (!this.gameObject.autoSize)
      return;

    this.gameObject.scale = 1;

    const scaleX = maxWidth / this.gameObject.width;
    const scaleY = maxHeight / this.gameObject.height;
    const scale = Math.min(scaleX, scaleY);

    this.gameObject.scale = Math.min(maxScale, scale);
  }
}