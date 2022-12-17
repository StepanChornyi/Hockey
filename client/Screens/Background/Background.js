import { GameObject, Black, Sprite, Graphics, GraphicsLinearGradient, ColorHelper, DisplayObject } from 'black-engine';

export default class Background extends DisplayObject {
  constructor() {
    super();

    const bg = this._bg = new Sprite("bg");
    const bgOverlay = this._bgOverlay = new Graphics();
    const gradient = new GraphicsLinearGradient(0, 0, 1000, 0);

    gradient.addColorStop(0, ColorHelper.intToRGBA(0x000000, 0.9));
    gradient.addColorStop(0.2, ColorHelper.intToRGBA(0x000000, 0.7));
    gradient.addColorStop(0.8, ColorHelper.intToRGBA(0x000000, 0.7));
    gradient.addColorStop(1, ColorHelper.intToRGBA(0x000000, 0.9));

    bgOverlay.fillGradient(gradient);
    bgOverlay.beginPath();
    bgOverlay.rect(0, 0, 1000, 100);
    bgOverlay.fill();

    this.add(bg, bgOverlay);

    Black.stage.on("resize", this._resizeBg.bind(this)).callback();
  }

  _resizeBg() {
    const stage = Black.stage;
    const stageBounds = stage.getBounds();
    const center = stageBounds.center();

    const bg = this._bg;
    const bgOverlay = this._bgOverlay;

    bg.alignAnchor();
    bg.x = center.x;
    bg.y = center.y;
    bg.scale = 1;
    bg.scale = Math.max(stageBounds.width / bg.width, stageBounds.height / bg.height);

    bgOverlay.alignAnchor();
    bgOverlay.x = center.x;
    bgOverlay.y = center.y;
    bgOverlay.width = stageBounds.width;
    bgOverlay.height = stageBounds.height;
    bgOverlay.scaleX = Math.max(1, bgOverlay.scaleX);
  }
}