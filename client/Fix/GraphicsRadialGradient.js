import { GraphicsGradient, ColorHelper } from "black-engine";

export default class GraphicsRadialGradient extends GraphicsGradient {
  constructor(x0, y0, r0, x1, y1, r1) {
    super();

    this.x0 = x0;
    this.y0 = y0;
    this.r0 = r0;
    this.x1 = x1;
    this.y1 = y1;
    this.r1 = r1;

    this.isAbsolute = false;
  }

  clone() {
    const g = new GraphicsRadialGradient(this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
    g.isAbsolute = this.isAbsolute;

    for (let key in this.stops) {
      g.stops[key] = this.stops[key];
    }

    return g;
  }

  addColorStop(offset, hexColor, alpha = 1) {
    super.addColorStop(offset, ColorHelper.intToRGBA(hexColor, alpha));
  }
}
