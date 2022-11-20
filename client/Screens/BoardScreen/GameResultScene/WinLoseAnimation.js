import { Black, Graphics, Emitter, FloatScatter, Modifier, ColorHelper, BlendMode, Timer, MathEx, Vector, Ease, DisplayObject, TextField, CanvasRenderTexture, Sprite, Tween, MessageDispatcher } from 'black-engine';
import GlowingText from '../../../Lib/GlowingText';

export default class WinLoseAnimation extends DisplayObject {
  constructor() {
    super();

    const particlesEffect = this._particlesEffect = new ParticlesEffect();
    const winText = this._winText = new GlowingText('You Win', { strokeColor: 0x58e83f, glowColor: 0x00ff00 });
    const loseText = this._loseText = new GlowingText('You Lose', { strokeColor: 0xff0000, glowColor: 0xff0000 });

    winText.addChildUnderText(particlesEffect);

    winText.alpha = 0;
    loseText.alpha = 0;

    this.add(winText, loseText);
  }

  playWin() {
    const winText = this._winText;
    const particlesEffect = this._particlesEffect;

    winText.scale = 2;

    winText.addComponent(new Tween({
      scale: 1,
    }, 0.2, {
      ease: Ease.backOut
    }));

    winText.addComponent(new Tween({
      alpha: 1,
    }, 0.1));

    particlesEffect.play(0.5);

    particlesEffect.addComponent(new Timer(0.5))
      .on("complete", () => particlesEffect.play(1))

    winText.addComponent(new Tween({
      glowAlpha: 1,
    }, 1, { delay: 0.5 }));

    Black.audio.play("win", "master", 1);
  }

  playLose() {
    const loseText = this._loseText;
    const particlesEffect = this._particlesEffect;

    loseText.scale = 2;

    loseText.addComponent(new Tween({
      scale: 1,
    }, 0.3, {
      ease: Ease.backOut
    }));

    loseText.addComponent(new Tween({
      alpha: 1,
    }, 0.2));

    loseText.addComponent(new Tween({
      glowAlpha: 1,
    }, 1, { delay: 0.5 }));

    loseText.addComponent(new Timer(2))

    Black.audio.play("lose", "master", 1);
  }

  hide(){
    this._loseText.alpha = 0;
    this._winText.alpha = 0;
  }
}

class ParticlesEffect extends DisplayObject {
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

    // for (const texture of emitter.textures) {
    //   texture.set(texture.native, null, null, 1 / 3);
    // }

    emitter.space = this;
    emitter.blendMode = BlendMode.ADD;
    emitter.emitCount = new FloatScatter(0);
    emitter.emitDelay = new FloatScatter(0);
    emitter.emitInterval = new FloatScatter(0);
    emitter.emitDuration = new FloatScatter(0);
    emitter.emitNumRepeats = new FloatScatter(0);

    this.add(emitter);
  }

  play(scale = 1) {
    const emitter = this._emitter;
    const initModifier = this._initModifier;

    // emitter.x = pos.x;
    // emitter.y = pos.y;

    const isGreen = true;

    initModifier.textureIndex = isGreen ? 2 : 1;
    initModifier.scale = scale;

    // initModifier.normal.copyFrom(normal);

    emitter.emitCount = new FloatScatter(scale * 80);
    emitter.emitDuration = new FloatScatter(0.1);
    emitter.emitNumRepeats = new FloatScatter(1);

    emitter.play();
  }



}

class InitialParticleModifier extends Modifier {
  constructor() {
    super();

    this.textureIndex = 0;
    this.speed = 1200;
    this.scale = 1;

    this._tmpVec = new Vector();
  }

  update(e, p) {
    p.scaleX = p.scaleY = MathEx.lerp(1, 1.2, Math.random());
    p.life = 2.5;

    p.alpha = 0.7;
    p.x = 0;
    p.y = 0;
    p.r = MathEx.lerp(-1, 1, Math.random());
    p.textureIndex = this.textureIndex;

    const angle = Math.random() * Math.PI * 2;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    const xVelOffset = MathEx.lerp(-1, 1, Math.random()) * 1000 * this.scale;
    const cosSign = cos < 0 ? -1 : 1;
    const yFactor = Math.abs(cos * cos) * cosSign * 0.5;

    const speed = Math.random() * this.speed * this.scale;

    p.vx = xVelOffset + sin * speed;
    p.vy = yFactor * speed;
  }
}

class UpdateParticleModifier extends Modifier {
  constructor() {
    super(false);
  }

  update(e, p, dt) {
    p.vx *= 0.95;
    p.vy *= 0.95;

    p.scaleX *= 0.98;
    p.scaleY = p.scaleX;

    if (p.scaleX < 0.4) {
      p.alpha *= 0.93;
    }

    p.r += (p.r < 0 ? -1 : 1) * p.scaleX * 4 * dt;
  }
}

