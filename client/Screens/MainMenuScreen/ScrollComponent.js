import { Component, Vector, Black } from "black-engine";

export default class ScrollComponent extends Component {
  constructor(inputObject) {
    super();

    this._inputObject = inputObject;

    this._scrollData = {
      isPressed: false,
      isScrolled: false,
      isMoved: false,

      topOffset: 0,

      prevPos: new Vector(),
      speed: new Vector(),
      pressPos: new Vector(),
    };
  }

  onAdded() {
    const scrollData = this._scrollData;
    const { prevPos, speed, pressPos } = scrollData;

    this.gameObject.on('wheel', (_, pointerData) => {
      speed.y -= pointerData.delta * 7;
    });

    this.gameObject.on('pointerDown', (_, pointerData) => {
      prevPos.copyFrom(pointerData);
      pressPos.copyFrom(pointerData);
      speed.set(0, 0);
      scrollData.isPressed = true;
      scrollData.isScrolled = false;
      scrollData.isMoved = false;
    });

    const topBound = this._topScrollBound;

    this.gameObject.on('pointerMove', (_, pointerData) => {
      if (!scrollData.isPressed) return;

      const maxDistance = 300;
      const distanceTop = topBound - this.gameObject.bounds.top;
      const bottomBound = Math.min(Black.stage.bounds.bottom, this.gameObject.bounds.height);
      const distanceBottom = bottomBound - this.gameObject.bounds.bottom;

      const distance = (() => {
        if (distanceTop < 0) return distanceTop;
        if (distanceBottom > 0) return distanceBottom;
        return 0;
      })();

      if (Math.abs(pressPos.y - pointerData.y) > 10) {
        scrollData.isMoved = true;
      }

      const speedFactor = 1 - Math.min(Math.abs(distance), maxDistance) / maxDistance + 0.5;
      const speedY = (pointerData.y - prevPos.y) * speedFactor;

      this.gameObject.y += speedY;

      speed.y = (speed.y + speedY) * 0.5;

      prevPos.copyFrom(pointerData);
    });

    this.gameObject.on('pointerUp', () => {
      scrollData.isPressed = false;
    });
  }

  onUpdate() {
    const scrollData = this._scrollData;

    if (scrollData.isPressed)
      return;

    let friction = 0.05;

    const dtFactor = Black.time.dt / 0.0166666;

    const { speed } = scrollData;

    const topBound = this._topScrollBound;
    const distanceTop = topBound - this.gameObject.bounds.top;
    const bottomBound = Math.min(Black.stage.bounds.bottom, topBound + this.gameObject.bounds.height);
    const distanceBottom = this.gameObject.bounds.bottom - bottomBound;

    // console.log(Math.round(distanceTop), Math.round(distanceBottom));

    const distance = (() => {
      if (distanceTop < 0) return distanceTop;
      if (distanceBottom < 0) return distanceBottom;
      return 0;
    })();

    if (Math.abs(distance) > 0)
      scrollData.isScrolled = true;

    if (scrollData.isScrolled) {
      if (distanceTop < 0) {
        this.gameObject.y += distanceTop * 0.2;
      } else if (distanceBottom < 0) {
        this.gameObject.y -= distanceBottom * 0.2;
      }

      friction = 0.1;
    }

    speed.y *= 1 - friction;
    this.gameObject.y += speed.y * dtFactor;
  }

  get _topScrollBound() {
    return Black.stage.bounds.top + this._scrollData.topOffset;
  }

  get topOffset() {
    return this._scrollData.topOffset;
  }

  set topOffset(val) {
    this._scrollData.topOffset = val;

    if (this.gameObject.bounds.top < this._topScrollBound) {
      this.gameObject.y += this._topScrollBound - this.gameObject.bounds.top;
    }
  }
}