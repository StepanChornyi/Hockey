import { Vector, CanvasRenderTexture, ColorHelper, Emitter, FloatScatter, Modifier, BlendMode, DisplayObject, Black, MathEx } from 'black-engine';
import { BOARD_CENTER, GATES_SIZE } from '../BoardConfig';

export default class GoalEffect extends DisplayObject {
  constructor() {
    super();

    const emitter = this._emitter = new Emitter();

    this._initModifier = emitter.addModifier(new InitialParticleModifier());

    emitter.add(new UpdateParticleModifier());

    emitter.textures = [
      Black.assets.getTexture("particleBlue"),
      Black.assets.getTexture("particleRed"),
      Black.assets.getTexture("particleGreen"),
    ];

    for (const texture of emitter.textures) {
      texture.set(texture.native, null, null, 1 / 3);
    }

    emitter.space = this;
    emitter.blendMode = BlendMode.ADD;
    emitter.emitCount = new FloatScatter(0);
    emitter.emitDelay = new FloatScatter(0);
    emitter.emitInterval = new FloatScatter(0);
    emitter.emitDuration = new FloatScatter(0);
    emitter.emitNumRepeats = new FloatScatter(0);

    this.add(emitter);
  }

  show(pos, normal, size, isGreen) {
    const emitter = this._emitter;
    const initModifier = this._initModifier;

    emitter.x = pos.x;
    emitter.y = pos.y;

    initModifier.textureIndex = isGreen ? 2 : 1;

    initModifier.normal.copyFrom(normal);
    initModifier.speed = 600;
    initModifier.size = size;

    emitter.emitCount = new FloatScatter(15);
    emitter.emitDuration = new FloatScatter(0.15);
    emitter.emitNumRepeats = new FloatScatter(1);

    emitter.play();
  }
}

class InitialParticleModifier extends Modifier {
  constructor() {
    super();

    this.normal = new Vector(1, 0);
    this.startVel = new Vector(0, 0);
    this.size = 0;
    this.textureIndex = 0;
    this.speed = 0;

    this._tmpVec = new Vector();
  }

  update(e, p) {
    p.scaleX = p.scaleY = MathEx.lerp(0.5, 0.7, Math.random());
    p.life = 1;

    const offset = this.size * (Math.random() - 0.5);
    let distFactor = 1 - Math.abs(offset) / (this.size * 0.5);

    distFactor *= distFactor;

    p.alpha = 0.7;
    p.x = this.normal.y * offset;
    p.y = this.normal.x * offset;
    p.r = MathEx.lerp(-1, 1, Math.random());
    p.textureIndex = this.textureIndex;

    const speed = Math.random() * this.speed;
    const angleOffset = (Math.random() - 0.5) * Math.PI * 0.3;
    const speedNormal = this._tmpVec.copyFrom(this.normal).setRotation(angleOffset);

    p.vx = this.startVel.x + speedNormal.x * speed;
    p.vy = this.startVel.y + speedNormal.y * speed * distFactor;
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