import SegmentBody from "./SegmentBody";
import Vec2 from "./Vec2";

export default class CircleBody {
  constructor(x, y, r) {
    this.id = -1;

    this.futurePath = new SegmentBody(x, y, x, y, r);
    this.position = new Vec2(x, y);
    this.velocity = new Vec2(0, 0);
    this.maxSpeed = Infinity;
    this.radius = r;
    this.mass = Math.PI * r * r;
    this.lastCollidedBody = null;
    this.collisionCallback = null;
    this.segmentsCheck = true;
    this.disabled = false;
  }

  clone() {
    const clone = new CircleBody(this.x, this.y, this.r);

    clone.vx = this.vx;
    clone.vy = this.vy;

    return clone;
  }

  updatePath(dt = 1) {
    this.futurePath.set(
      this.x,
      this.y,
      this.x + this.vx * dt,
      this.y + this.vy * dt,
      this.r
    );
  }

  move(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  setVelocity(v, clamp = true) {
    this.velocity.copyFrom(v);

    if (this.maxSpeed === Infinity || !clamp)
      return;

    const speed = this.velocity.length();

    if (speed === 0)
      return;

    this.velocity.multiplyScalar(Math.min(speed, this.maxSpeed) / speed);
  }

  onCollision(collisionData) {
    if (this.collisionCallback) {
      this.collisionCallback(collisionData);
    }
  }

  intersects(circle) {
    return this.position.distance(circle) < (this.radius + circle.radius);
  }

  stopMove() {
    this.vx = this.vy = 0;
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  set x(val) {
    this.position.x = val;
  }

  set y(val) {
    this.position.y = val;
  }

  get vx() {
    return this.velocity.x;
  }

  get vy() {
    return this.velocity.y;
  }

  set vx(val) {
    this.velocity.x = val;
  }

  set vy(val) {
    this.velocity.y = val;
  }

  get velocityModule() {
    return this.velocity.clone().transform(this.futurePath.rect.getNeg()).x
  }

  get r() {
    return this.radius;
  }

  get isCircle() {
    return true;
  }

  toData() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      r: this.r,
      vx: this.vx,
      vy: this.vy,
      lastCollidedBodyId: this.lastCollidedBody ? this.lastCollidedBody.id : null,
      disabled: this.disabled,
    };
  }

  copyFrom(circleBody, world) {
    this.x = circleBody.x;
    this.y = circleBody.y;
    this.vx = circleBody.vx;
    this.vy = circleBody.vy;
    this.disabled = circleBody.disabled;

    if (circleBody.lastCollidedBodyId) {
      this.lastCollidedBody = world.getBodyById(circleBody.lastCollidedBodyId);
    } else {
      this.lastCollidedBody = null
    }
  }

  static createFrom({ x, y, r, id = -1 }) {
    const body = new CircleBody(x, y, r);

    body.id = id;

    return body;
  }
}