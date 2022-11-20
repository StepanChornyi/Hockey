export default class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vec2(this.x, this.y);
  }

  subtract(v) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  copyFrom(v) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  copyTo(v) {
    v.x = this.x;
    v.y = this.y;

    return this;
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  multiplyScalar(a) {
    this.x *= a;
    this.y *= a;

    return this;
  }

  set(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  normalize(length = this.length()) {
    if (length > 0) {
      this.multiplyScalar(1 / length);
    }

    return this;
  }

  multiply(v) {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  length() {
    return Math.sqrt(this.lengthSqr());
  }

  lengthSqr() {
    return this.x * this.x + this.y * this.y;
  }

  distance(v) {
    let x = this.x - v.x;
    let y = this.y - v.y;

    return Math.sqrt((x * x) + (y * y));
  }

  transform(normal, origin = null) {
    if (origin !== null) {
      this.x -= origin.x;
      this.y -= origin.y;
    }

    const x = this.x * normal.x - this.y * normal.y;
    const y = this.x * normal.y + this.y * normal.x;

    if (origin !== null) {
      this.x = x + origin.x;
      this.y = y + origin.y;
    } else {
      this.x = x;
      this.y = y;
    }

    return this;
  }

  lerp(v, t) {
    this.x = this.x + (v.x - this.x) * t;
    this.y = this.y + (v.y - this.y) * t;

    return this;
  }

  clamp(minX, maxX, minY, maxY) {
    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));

    return this;
  }

  static create(x = 0, y = 0) {
    return new Vec2(x, y);
  }

  static createFrom(v) {
    return new Vec2(v.x, v.y);
  }

  static proj(a, b) {
    return b.clone().multiplyScalar(a.dot(b) / b.dot(b));
  }

  static reflect(a, n) {
    return Vec2.proj(a, n).multiplyScalar(2).add(a.clone().multiplyScalar(-1));
  }
}