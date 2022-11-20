import { Vector, CanvasRenderTexture, ColorHelper, Emitter, FloatScatter, Modifier, BlendMode, DisplayObject, Black, MathEx } from 'black-engine';
import Utils from '../../../../Utils';

export default class CollisionEffect extends DisplayObject {
  constructor(config) {
    super();

    const emitter = this._emitter = new Emitter();

    this._initModifier = emitter.addModifier(new InitialParticleModifier(config.ballRadius));

    emitter.add(new UpdateParticleModifier());

    emitter.textures = [
      Black.assets.getTexture("particleBlue"),
      Black.assets.getTexture("particleRed"),
      Black.assets.getTexture("particleGreen"),
    ];

    for (const texture of emitter.textures) {
      texture.set(texture.native, null, null, 1 / 3);
    }

    // createParticleTexture(0x7abbff),
    // createParticleTexture(config.aColor),
    // createParticleTexture(config.bColor),

    emitter.space = this;
    emitter.blendMode = BlendMode.ADD;
    emitter.emitCount = new FloatScatter(0);
    emitter.emitDelay = new FloatScatter(0);
    emitter.emitInterval = new FloatScatter(0);
    emitter.emitDuration = new FloatScatter(0);
    emitter.emitNumRepeats = new FloatScatter(0);

    this.add(emitter);
  }

  showCollision(ball, collisionData, isRed) {
    const emitter = this._emitter;
    const initModifier = this._initModifier;
    const bodyB = collisionData.bodyA.id === ball.id ? collisionData.bodyB : collisionData.bodyA;

    emitter.x = ball.x;
    emitter.y = ball.y;

    const normal = collisionData.normal ? new Vector().copyFrom(collisionData.normal) : new Vector().copyFrom(ball).subtract(bodyB).normalize();

    initModifier.normal.copyFrom(normal.multiplyScalar(-1));
    initModifier.speed = Math.min(2000, MathEx.distance(ball.x, ball.y, 0, 0) * 3);

    if (collisionData.isCircle) {
      const bodyB = collisionData.bodyA.id === ball.id ? collisionData.bodyB : collisionData.bodyA;

      initModifier.textureIndex = isRed ? 1 : 2;

      initModifier.startVel.set(bodyB.vx, bodyB.vy).multiplyScalar(0.5);
    } else {
      initModifier.startVel.set(0, 0);

      initModifier.textureIndex = 0;
    }

    emitter.emitCount = new FloatScatter(initModifier.speed / 200);
    emitter.emitDuration = new FloatScatter(0.00001);
    emitter.emitNumRepeats = new FloatScatter(1);

    emitter.play();
  }
}

function createParticleTexture(color) {
  const r = 15;
  const texture = new CanvasRenderTexture(r * 2, r * 2, 3);
  const canvas = texture.native;

  canvas.width = canvas.height = r * 2;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = ColorHelper.intToRGBA(color);
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();

  return texture;
}

class InitialParticleModifier extends Modifier {
  constructor(radius) {
    super();

    this.normal = new Vector(1, 0);
    this.startVel = new Vector(0, 0);
    this.radius = radius;
    this.textureIndex = 0;
    this.speed = 0;
  }

  update(e, p) {
    p.scaleX = p.scaleY = MathEx.lerp(0.5, 0.7, Math.random());
    p.life = 1;

    p.alpha = 0.7;
    p.x = this.normal.x * this.radius;
    p.y = this.normal.y * this.radius;
    p.r = MathEx.lerp(-1, 1, Math.random());
    p.textureIndex = this.textureIndex;

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * this.speed * 0.2;
    const localNormal = new Vector(Math.sin(angle), Math.cos(angle));

    if (localNormal.dot(this.normal) > 0) {
      localNormal.multiplyScalar(-1);
    }

    p.vx = this.startVel.x + localNormal.x * speed;
    p.vy = this.startVel.y + localNormal.y * speed;

    p.color = 0x8bcaf7;
  }
}

class UpdateParticleModifier extends Modifier {
  constructor() {
    super(false);
  }

  update(e, p, dt) {
    p.vx *= 0.94;
    p.vy *= 0.94;

    p.scaleX *= 0.98;
    p.scaleY = p.scaleX;

    if (p.scaleX < 0.3) {
      p.alpha *= 0.9;
    }

    p.r += (p.r < 0 ? -1 : 1) * p.scaleX * 4 * dt;
  }
}