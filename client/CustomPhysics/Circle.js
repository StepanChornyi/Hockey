import Vec2 from "./Vec2";

export default class Circle {
  constructor(x, y, r) {
    this.position = new Vec2(x, y);
    this.r = r;
  }

  clone() {
    return new Circle(this.x, this.y, this.r);
  }

  copyFrom(c) {
    this.x = c.x;
    this.y = c.y;
    this.r = c.r;

    return this;
  }

  copyTo(c) {
    c.x = this.x;
    c.y = this.y;
    c.r = this.r;

    return this;
  }

  set(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;

    return this;
  }

  get x() {
    return this.position.x;
  }

  set x(x) {
    this.position.x = x;
  }

  get y() {
    return this.position.y;
  }

  set y(y) {
    this.position.y = y;
  }

  get radius() {
    return this.r;
  }

  set radius(r) {
    this.r = r;
  }
}