const { Engine, Black, Device } = require("black-engine");

export class EngineFix extends Engine {
  __initialize() {
    this.mContainerElement = /** @type {!HTMLElement} */ (document.getElementById(this.mContainerElementId));

    if (!this.mContainerElement)
      throw new Error('Container element was not found');

    Black.device = new Device();

    this.mStageWidth = this.mContainerElement.clientWidth;
    this.mStageHeight = this.mContainerElement.clientHeight;
    this.mUseHiDPR = Black.device.isMobile;

    this.__bootViewport();
    this.__update = this.__update.bind(this);
  }
}