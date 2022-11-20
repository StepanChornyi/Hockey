import Vec2 from "./Vec2";

export default class Rect {
  constructor(x = 0, y = 0, width = 0, height = 0, normal = new Vec2()) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this._rotation = null;

    this.normal = normal;
    this.isRect = true;
  }

  get a() {
    return this._getA();
  }

  get b() {
    return this._getB();
  }

  get c() {
    return this._getC();
  }

  get d() {
    return this._getD();
  }

  get rotation() {
    if (this._rotation === null) {
      this._rotation = Math.atan2(this.normal.y, this.normal.x);
    }

    return this._rotation;
  }

  set rotation(angle) {
    this._rotation = angle;

    this.normal.x = Math.cos(angle);
    this.normal.y = Math.sin(angle);
  }

  set(x, y, width, height, normal) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.normal.copyFrom(normal);
    this._rotation = null;

    return this;
  }

  clone() {
    return new Rect(this.x, this.y, this.width, this.height, this.normal.clone());
  }

  getPoints(isRotated = true, transformRect = null) {
    const normal = isRotated ? this.normal : Vec2.create(1, 0);

    const points = {
      a: this._getA(normal),
      b: this._getB(normal),
      c: this._getC(normal),
      d: this._getD(normal)
    };

    if (transformRect !== null) {
      const negB = transformRect.getNeg();

      points.a.transform(negB, transformRect);
      points.b.transform(negB, transformRect);
      points.c.transform(negB, transformRect);
      points.d.transform(negB, transformRect);
    }

    return points;
  }

  getNeg() {
    return new Vec2(
      this.normal.x,
      -this.normal.y
    );
    // return new Vec2(
    //   Math.cos(-this.rotation),
    //   Math.sin(-this.rotation)
    // );
  }

  _getA(normal = this.normal) {
    return this._getVert(-1, -1, normal);
  }

  _getB(normal = this.normal) {
    return this._getVert(1, -1, normal);
  }

  _getC(normal = this.normal) {
    return this._getVert(1, 1, normal);
  }

  _getD(normal = this.normal) {
    return this._getVert(-1, 1, normal);
  }

  _getVert(xx, yy, normal) {
    const x = xx * this.width * 0.5;
    const y = yy * this.height * 0.5;

    return new Vec2(
      this.x + normal.x * x - normal.y * y,
      this.y + normal.y * x + normal.x * y
    );
  }

  static fromPoints(pointA, pointB, radius, outRect = new Rect()) {
    pointA = Vec2.createFrom(pointA);
    pointB = Vec2.createFrom(pointB);

    return outRect.set(
      (pointA.x + pointB.x) * 0.5,
      (pointA.y + pointB.y) * 0.5,
      radius * 2 + pointA.distance(pointB),
      radius * 2,
      pointB.subtract(pointA).normalize()
    );
  }

  static fromCircles(circA, circB, outRect = new Rect()) {
    const pointA = Vec2.createFrom(circA);
    const pointB = Vec2.createFrom(circB);
    const normal = pointB.clone().subtract(pointA);
    const distance = normal.length();

    if (distance === 0) {
      normal.set(1, 0);
    } else {
      normal.normalize(distance);
    }

    return outRect.set(
      (pointA.x + pointB.x) * 0.5,
      (pointA.y + pointB.y) * 0.5,
      circA.r * 2 + distance,
      circA.r * 2,
      normal
    );
  }

  static create(center, width, height, rotation = 0) {
    const rect = new Rect(
      center.x,
      center.y,
      width,
      height,
      Vec2.create(1, 0)
    );

    if (rotation !== 0) {
      rect.rotation = rotation;
    }

    return rect;
  }
}