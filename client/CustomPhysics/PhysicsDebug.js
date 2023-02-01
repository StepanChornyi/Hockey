import { Graphics, DisplayObject, CapsStyle, ColorHelper, BlendMode, MathEx, Ease, HSV, RGB } from "black-engine";
import GraphicsRadialGradient from "../Fix/GraphicsRadialGradient";

export default class PhysicsDebug extends DisplayObject {
  constructor(world) {
    super();

    this._world = world;
    this._g = this.addChild(new Graphics());
  }

  onUpdate() {
    this._g.clear();

    for (let i = 0; i < this._world.bodies.length; i++) {
      this._drawBodyView(this._world.bodies[i]);
    }
  }

  _drawBodyView(body) {
    if (body.isSegment) {
      this._drawSegmentBodyView(body);
    } else if (body.isCircle) {
      if (!body.disabled)
        this._drawCircleBodyView(body);
    } else if (body.isRect) {
      this._drawRectBody(body);
    } else {
      console.warn("Unknown body type!");
    }
  }

  _drawSegmentBodyView(segmentBody) {
    return;
    const g = this._g;

    let color = 0xf50525;

    if (!isNaN(segmentBody.color)) {
      color = ColorHelper.lerpHSV(0x4a3da1, segmentBody.color, segmentBody.colorT);
    }

    g.lineStyle(segmentBody.r * 2, color, 1, CapsStyle.ROUND);
    g.beginPath();
    g.moveTo(
      segmentBody.ax,
      segmentBody.ay
    )
    g.lineTo(
      segmentBody.bx,
      segmentBody.by
    );
    g.stroke();
    g.closePath();
  }

  _drawCircleBodyView(circleBody) {
    const g = this._g;

    if (circleBody.color === null) {
      // g.lineStyle(1, 0x0c7ef7, 0.8);
      // g.fillStyle(0xffffff);
      // g.beginPath();
      // g.circle(
      //   circleBody.x,
      //   circleBody.y,
      //   circleBody.radius,
      // );
      // g.closePath();
      // g.fill();
      // g.stroke();

      return;
    }
    return;

    const lineWidth = circleBody.radius * 0.45;

    const colorRGB = ColorHelper.hex2rgb(circleBody.color);
    const lightRGB = ColorHelper.hex2rgb(circleBody.lightColor);

    const color = ColorHelper.rgb2hex(new RGB(
      MathEx.lerp(colorRGB.r, lightRGB.r, circleBody.lightT * 0.7),
      MathEx.lerp(colorRGB.g, lightRGB.g, circleBody.lightT * 0.7),
      MathEx.lerp(colorRGB.b, lightRGB.b, circleBody.lightT * 0.7),
    ))

    g.lineStyle(lineWidth, color, 0.7);
    g.beginPath();
    g.circle(
      circleBody.x,
      circleBody.y,
      circleBody.radius - lineWidth * 0.5,
    );
    g.closePath();
    g.stroke();

    g.lineStyle(lineWidth - 1, color, 1);
    g.beginPath();
    g.circle(
      circleBody.x,
      circleBody.y,
      circleBody.radius - lineWidth * 0.5
    );
    g.closePath();
    g.stroke();

    if (circleBody.strokeAlpha) {
      let t = 1 - circleBody.strokeAlpha;

      const offset = circleBody.radius * (0.8 + t * 0.2);
      const x = circleBody.x + offset * circleBody.hitNormal.x;
      const y = circleBody.y + offset * circleBody.hitNormal.y;

      const rIn = MathEx.lerp(0, circleBody.radius * 2, t);
      const rOut = MathEx.lerp(0, circleBody.radius * 2 + 20, t);

      const gradient = g.createRadialGradient(x, y, rIn, x, y, rOut);

      gradient.addColorStop(0, 0xffffff, 0);
      gradient.addColorStop(0.1, 0xffffff, 0.8);
      gradient.addColorStop(0.9, 0xffffff, 0.8);
      gradient.addColorStop(1, 0xffffff, 0);

      g.lineStyle(lineWidth - 1, circleBody.color, 1);
      g.strokeGradient(gradient);
      g.beginPath();
      g.circle(
        circleBody.x,
        circleBody.y,
        circleBody.radius - lineWidth * 0.5
      );
      g.closePath();
      g.stroke();
    }
  }

  _drawRectBody(body) {
    const g = this._g;

    g.fillStyle(0x00ff00, 0.3);

    if (body.isRed) {
      g.fillStyle(0xaa00ff, 0.3);
    }

    g.beginPath();
    g.moveTo(body.a.x, body.a.y);
    g.lineTo(body.b.x, body.b.y);
    g.lineTo(body.c.x, body.c.y);
    g.lineTo(body.d.x, body.d.y);
    g.closePath();
    g.fill();
  }

  _drawBoundingBox(rect, color = 0xff0000) {
    const g = this._g;

    g.setLineDash([1, 0, 1]);

    g.lineStyle(1, color, 1);
    g.beginPath();
    g.moveTo(rect.a.x, rect.a.y);
    g.lineTo(rect.b.x, rect.b.y);
    g.lineTo(rect.c.x, rect.c.y);
    g.lineTo(rect.d.x, rect.d.y);
    g.closePath();
    g.stroke();

    g.setLineDash([]);
  }
}

function lerpHSV(hex1, hex2, factor = 0.5) {
  const c1 = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(hex1));
  const c2 = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(hex2));
  const c = new HSV();

  const dh = c2.h - c1.h;
  const ds = c2.s - c1.s;
  const dv = c2.v - c1.v;

  if (Math.abs(dh) > 0.5) {
    if (c1.h < c2.h) {
      c1.h += 1;
    } else {
      c2.h += 1;
    }
  }

  c.h = (c1.h < c2.h ? MathEx.lerp(c1.h, c2.h, factor) : MathEx.lerp(c2.h, c1.h, 1 - factor)) % 1;

  if (Math.abs(ds) > 0.5) {
    if (c1.s < c2.s) {
      c1.s += 1;
    } else {
      c2.s += 1;
    }
  }

  c.s = (c1.s < c2.s ? MathEx.lerp(c1.s, c2.s, factor) : MathEx.lerp(c2.s, c1.s, 1 - factor)) % 1;

  if (Math.abs(dv) > 0.5) {
    if (c1.v < c2.v) {
      c1.v += 1;
    } else {
      c2.v += 1;
    }
  }

  c.v = (c1.v < c2.v ? MathEx.lerp(c1.v, c2.v, factor) : MathEx.lerp(c2.v, c1.v, 1 - factor)) % 1;

  return ColorHelper.rgb2hex(ColorHelper.hsv2rgb(c));
}