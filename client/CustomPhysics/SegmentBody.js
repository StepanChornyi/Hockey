import Circle from "./Circle";
import Rect from "./Rect";

export default class SegmentBody {
  constructor(ax, ay, bx, by, r = 0.5) {
    this.id = -1;

    this.r = r;

    this.circA = new Circle(ax, ay, r);
    this.circB = new Circle(bx, by, r);

    this.rect = Rect.fromCircles(this.circA, this.circB);
    this.collisionCallback = null;
  }

  set(ax, ay, bx, by, r) {
    this.r = r;

    this.circA.x = ax;
    this.circA.y = ay;

    this.circB.x = bx;
    this.circB.y = by;

    Rect.fromCircles(this.circA, this.circB, this.rect);

    return this;
  }

  getPoint(t) {
    return this.a.clone().lerp(this.b, t);
  }

  onCollision(collisionData) {
    if (this.collisionCallback) {
      this.collisionCallback(collisionData)
    }
  }

  get ax() {
    return this.a.x;
  }

  get ay() {
    return this.a.y;
  }

  get bx() {
    return this.b.x;
  }

  get by() {
    return this.b.y;
  }

  get a() {
    return this.circA.position;
  }

  get b() {
    return this.circB.position;
  }

  get radius() {
    return this.r;
  }

  get isSegment() {
    return true;
  }

  toData() {
    return {
      id: this.id,
      ax: this.ax,
      ay: this.ay,
      bx: this.bx,
      by: this.by,
      r: this.r,
    }
  }
}