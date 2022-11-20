import Vec2 from "./Vec2";

export default class PhysicsWorld {
  constructor() {
    this._bodies = [];
    this._circles = [];
    this._segments = [];
  }

  add(...bodies) {
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];

      if (body instanceof Array) {
        bodies.push(...body);
        continue;
      }

      if (body.isCircle) {
        this._circles.push(body);
      } else {
        this._segments.push(body);
      }

      this._bodies.push(body);
    }

    return this;
  }

  removeAll() {
    this._circles.splice(0);
    this._segments.splice(0);
    this._bodies.splice(0);
  }

  update(dt) {
    this._step(dt);
  }

  getBodyById(id) {
    for (let i = 0; i < this._bodies.length; i++) {
      if (this._bodies[i].id === id) {
        return this._bodies[i];
      }
    }

    return null;
  }

  _step(dt, stepsCount = 0, checkCircles = true) {
    if (stepsCount === 50) {
      console.warn("Cancel physics sub step, too much collisions!");
      return;
    }

    const circles = this._circles;

    this._updateCirclesPath(dt);

    const collisions = this._getAllCollisions(checkCircles);

    if (collisions.length === 0) {
      for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];

        circle.lastCollidedBody = null;

        if (circle.disabled)
          continue;

        circle.move(dt);
      }

      return stepsCount;
    }

    let negativeCollisionTimesCount = 0;

    for (let i = 0; i < collisions.length; i++) {
      if (collisions[i].t < 0) {
        negativeCollisionTimesCount++;
        break;
      }
    }

    if (negativeCollisionTimesCount) {
      for (let i = 0; negativeCollisionTimesCount === 1 && i < collisions.length; i++) {
        const { t, bodyA, bodyB, isCircle } = collisions[i];

        if (!isCircle || t >= 0)
          continue;

        const dist = bodyA.position.distance(bodyB);
        const forceFactor = 100;
        const totalImpulse = (1 - dist / (bodyA.radius + bodyB.radius)) * (bodyA.mass + bodyB.mass) * forceFactor;
        const normalA = bodyA.position.clone().subtract(bodyB).multiplyScalar(1 / dist);
        const normalB = normalA.clone().multiplyScalar(-1);
        const velA = bodyA.velocity.add(normalA.multiplyScalar(totalImpulse / bodyA.mass))
        const velB = bodyB.velocity.add(normalB.multiplyScalar(totalImpulse / bodyB.mass))

        bodyA.setVelocity(velA);
        bodyB.setVelocity(velB);

        bodyA.lastCollidedBody = null;
        bodyB.lastCollidedBody = null;
      }

      return this._step(dt, ++stepsCount, false);
    }

    collisions.sort((a, b) => {
      if (a.t === a.t)
        a.t *= 0.9999999;

      return a.t - b.t;
    });

    const collisionData = collisions[0];
    const { t, normal, bodyA, bodyB, isCircle } = collisionData;

    for (let i = 0; t > 0 && i < circles.length; i++) {
      if (!circles[i].disabled)
        circles[i].move(dt * t);
    }

    if (isCircle) {
      const resp = getCirclesCollisionResponse(bodyA, bodyB);

      bodyA.setVelocity(resp.responseA);
      bodyB.setVelocity(resp.responseB);

      bodyB.lastCollidedBody = bodyA;
    } else {
      bodyA.setVelocity(getCircleToSurfaceCollisionResponse(bodyA, normal));
    }

    bodyA.onCollision(collisionData);
    bodyB.onCollision(collisionData);

    bodyA.lastCollidedBody = bodyB;

    return this._step(dt * (1 - t), ++stepsCount);
  }

  _getAllCollisions(checkCircles) {
    const circles = this._circles;
    const segments = this._segments;
    const collisions = [];

    for (let i = 0; i < circles.length; i++) {
      const bodyA = circles[i];

      if (bodyA.disabled)
        continue;

      for (let j = i + 1; checkCircles && j < circles.length; j++) {
        const bodyB = circles[j];

        if (bodyB === bodyA.lastCollidedBody || bodyB.disabled)
          continue;

        if (!isRectsIntersects(bodyA.futurePath.rect, bodyB.futurePath.rect))
          continue;

        if (bodyA.intersects(bodyB)) {
          collisions.push({ t: -1, bodyA, bodyB, isCircle: true });

          continue;
        }

        const collisionTime = getCircleToCircleCollisionTime(bodyA.futurePath, bodyB.futurePath);

        if (collisionTime === null)
          continue;

        collisions.push({ t: collisionTime, bodyA, bodyB, isCircle: true });
      }

      for (let j = 0; bodyA.segmentsCheck && j < segments.length; j++) {
        const bodyB = segments[j];

        if (bodyB === bodyA.lastCollidedBody)
          continue;

        if (!isRectsIntersects(bodyA.futurePath.rect, bodyB.rect))
          continue;

        const collisionData = getCircleToSegmentCollision(bodyA.futurePath, bodyB);

        if (collisionData === null)
          continue;

        collisions.push({
          t: collisionData.t,
          normal: collisionData.normal,
          bodyA,
          bodyB,
        });
      }
    }

    return collisions;
  }

  _updateCirclesPath(dt = 0.016) {
    for (let i = 0; i < this._circles.length; i++) {
      this._circles[i].updatePath(dt);
    }
  }

  get bodies() {
    return this._bodies;
  }

  get segments() {
    return this._segments;
  }

  get circles() {
    return this._circles;
  }
}


function getCircleToSurfaceCollisionResponse(circle, surfNormal) {
  return Vec2.reflect(circle.velocity.multiplyScalar(-1), surfNormal);
}

function getCirclesCollisionResponse(a, b) {
  return {
    responseA: computeVel(a, b),
    responseB: computeVel(b, a)
  };
}

function computeVel(a, b) {
  const d = a.position.clone().subtract(b);
  const dist = d.length();

  return a.velocity.clone()
    .subtract(
      d.multiplyScalar((
        a.velocity.clone()
          .subtract(b.velocity)
          .dot(d) *
        (2 * b.mass / (a.mass + b.mass))
      ) / (dist * dist))
    );
}

function isRectsIntersects(rectA, rectB) {
  return isRectIntersects_(rectA, rectB) && isRectIntersects_(rectB, rectA);
}

function isRectIntersects_(rectA, rectB) {
  const pointsA = rectA.getPoints(false);
  const pointsB = rectB.getPoints(true, rectA);

  const minBx = Math.min(pointsB.a.x, pointsB.b.x, pointsB.c.x, pointsB.d.x);
  const maxBx = Math.max(pointsB.a.x, pointsB.b.x, pointsB.c.x, pointsB.d.x);
  const minBy = Math.min(pointsB.a.y, pointsB.b.y, pointsB.c.y, pointsB.d.y);
  const maxBy = Math.max(pointsB.a.y, pointsB.b.y, pointsB.c.y, pointsB.d.y);

  return (
    pointsA.a.x <= maxBx && pointsA.c.x >= minBx &&
    pointsA.a.y <= maxBy && pointsA.c.y >= minBy
  );
}

function getCircleToSegmentCollision(circlePath, segmentBody) {
  const intersection = linesIntersection(circlePath, segmentBody, false);

  if (!intersection)
    return null;

  const R = circlePath.r + segmentBody.r;
  const ang = Math.acos(circlePath.rect.normal.dot(segmentBody.rect.normal));
  const dist = R / Math.sin(ang);
  const offset = circlePath.rect.normal.clone().multiplyScalar(-dist);

  intersection.add(offset);

  const closest = pointSegmentClosest(intersection, segmentBody);

  if (isNaN(closest.x)) {
    return null
  }

  closest.subtract(circlePath.a);
  closest.transform(circlePath.rect.getNeg());

  const cosA = closest.y / R;

  if (Math.abs(cosA) > 1) {
    return null;
  }

  const sinA = Math.sqrt(1 - cosA * cosA);
  const p = closest.clone().add(new Vec2(R * -sinA, R * -cosA));

  const fullDist = circlePath.rect.width - circlePath.r * 2;
  const currDist = p.x;

  if (currDist <= 0 || currDist > fullDist) {
    return null;
  }

  return {
    t: currDist / fullDist,
    normal: new Vec2(-sinA, -cosA).transform(circlePath.rect.normal.clone())
  };
}

function getCircleToCircleCollisionTime(circPathA, circPathB) {
  const Ar = circPathA.r;
  const Ax0 = circPathA.a.x;
  const Adx = circPathA.b.x - circPathA.a.x;
  const Ay0 = circPathA.a.y;
  const Ady = circPathA.b.y - circPathA.a.y;

  const Br = circPathB.r;
  const Bx0 = circPathB.a.x;
  const Bdx = circPathB.b.x - circPathB.a.x;
  const By0 = circPathB.a.y;
  const Bdy = circPathB.b.y - circPathB.a.y;

  const a = (Adx - Bdx) * (Adx - Bdx) + (Ady - Bdy) * (Ady - Bdy);
  const b = 2 * (Ax0 * Adx - Ax0 * Bdx - Bx0 * Adx + Bx0 * Bdx + Ay0 * Ady - Ay0 * Bdy - By0 * Ady + By0 * Bdy);
  const c = (Ax0 - Bx0) * (Ax0 - Bx0) + (Ay0 - By0) * (Ay0 - By0) - (Ar + Br) * (Ar + Br);

  const D = b * b - 4 * a * c;

  if (D < 0) {
    return null;
  }

  const D_sqrt = Math.sqrt(D);

  const t1 = (-b - D_sqrt) / (2 * a);
  const t2 = (-b + D_sqrt) / (2 * a);

  if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
    return Math.min(t1, t2);
  } else if (t1 >= 0 && t1 <= 1) {
    return t1;
  } else if (t2 >= 0 && t2 <= 1) {
    return t2;
  }

  return null;
}

function linesIntersection({ a, b }, { a: e, b: f }, asSegment = true) {
  const result = new Vec2();

  let a1 = b.y - a.y;
  let a2 = f.y - e.y;
  let b1 = a.x - b.x;
  let b2 = e.x - f.x;
  let c1 = (b.x * a.y) - (a.x * b.y);
  let c2 = (f.x * e.y) - (e.x * f.y);
  let denom = (a1 * b2) - (a2 * b1);

  if (denom === 0) {
    return null;
  }

  result.x = ((b1 * c2) - (b2 * c1)) / denom;
  result.y = ((a2 * c1) - (a1 * c2)) / denom;

  if (asSegment) {
    let uc = ((f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y));
    let ua = (((f.x - e.x) * (a.y - e.y)) - (f.y - e.y) * (a.x - e.x)) / uc;
    let ub = (((b.x - a.x) * (a.y - e.y)) - ((b.y - a.y) * (a.x - e.x))) / uc;

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return result;
    } else {
      return null;
    }
  }

  return result;
};

function pointSegmentClosest(point, segment) {
  const AC = point.clone().subtract(segment.a);
  const AB = segment.b.clone().subtract(segment.a);

  const D = Vec2.proj(AC, AB).add(segment.a);

  const AD = D.clone().subtract(segment.a);

  const k = Math.abs(AB.x) > Math.abs(AB.y) ? AD.x / AB.x : AD.y / AB.y;

  if (k <= 0.0) {
    D.copyFrom(segment.a);
  } else if (k >= 1.0) {
    D.copyFrom(segment.b);
  }

  return D;
}