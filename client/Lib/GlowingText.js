import { Black, Graphics, Emitter, FloatScatter, Modifier, ColorHelper, BlendMode, Timer, MathEx, Vector, Ease, DisplayObject, TextField, CanvasRenderTexture, Sprite, Tween, MessageDispatcher, FontStyle, FontWeight } from 'black-engine';

export default class GlowingText extends DisplayObject {
  constructor(str, {
    strokeColor = 0xff0000,
    glowColor = 0xff0000,
    strokeThickness = 4,
    fontSize = 120,
    fontStyle = FontStyle.ITALIC,
    fontWeight = FontWeight.NORMAL,
  } = {}) {
    super();

    this._config = {
      strokeColor,
      glowColor,
      strokeThickness,
      fontSize,
      fontStyle,
      fontWeight
    };

    const textField = this._textField = new TextField(str, 'Arial', 0xffffff, fontSize, fontStyle, fontWeight);

    textField.align = "center";
    textField.vAlign = "middle";

    this._shadow = null;
    this._glow = null;

    this._shadowAlpha = 1;
    this._glowAlpha = 1;

    this._shadowsLayer = new DisplayObject();
    this._underTextLayer = new DisplayObject();

    textField.highQuality = true;
    textField.alignAnchor(0.5);

    this.add(this._shadowsLayer, this._underTextLayer, textField);
  }

  get scale() {
    return super.scale;
  }

  set scale(val) {
    super.scale = val;

    this._underTextLayer.scale = 1 / super.scale;
  }

  get glowAlpha() {
    return this._glowAlpha;
  }

  set glowAlpha(val) {
    this._glowAlpha = val;

    if (this._glow)
      this._glow.alpha = val;
  }

  get shadowAlpha() {
    return this._shadowAlpha;
  }

  set shadowAlpha(val) {
    this._shadowAlpha = val;

    if (this._shadow)
      this._shadow.alpha = val;
  }

  addChildUnderText(gameObject) {
    this._underTextLayer.addChild(gameObject);
  }

  onUpdate() {
    if (!this._hasEffects && this._textField.mRenderer.texture) {
      this._initEffects();

      this._textField.strokeThickness = this._config.strokeThickness;
      this._textField.strokeColor = this._config.strokeColor;
    }
  }

  get _hasEffects() {
    return this._glow !== null && this._shadow !== null;
  }

  _initEffects() {
    const shadow = this._shadow = this._createShadowSprite(50, 0x000000, 3);
    const glow = this._glow = this._createShadowSprite(25, this._config.glowColor, 1);

    this._shadowsLayer.addChildAt(shadow, 0);
    this._shadowsLayer.addChildAt(glow, 1);

    shadow.alpha = this._shadowAlpha;
    glow.alpha = this._glowAlpha;
  }

  _createShadowSprite(blur, color, passesCount = 1) {
    const origText = this._textField.mRenderer.texture;
    const texture = new CanvasRenderTexture(origText.native.width + blur * 2, origText.native.height + blur * 2, 1);
    const ctx = texture.renderTarget.context;

    ctx.save();

    ctx.shadowColor = ColorHelper.intToRGBA(color, 1);
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    while (passesCount-- > 0) {
      ctx.drawImage(origText.native, blur, blur, origText.native.width, origText.native.height);
    }

    ctx.restore();

    const shadowSprite = new Sprite(texture);

    shadowSprite.scale = origText.scale;
    shadowSprite.alignAnchor(0.5);

    return shadowSprite;
  }
}