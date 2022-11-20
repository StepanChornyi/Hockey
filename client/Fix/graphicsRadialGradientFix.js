import { Graphics, JSONAsset, GraphicsCommandType, Debug, GraphicsData, GraphicsRendererCanvas, ColorHelper, GraphicsLinearGradient, Black, ObjectPool, MathEx, Stage, RGB } from "black-engine";
import GraphicsRadialGradient from "./GraphicsRadialGradient";

GraphicsCommandType.FILL_RAD_GRD = 'gradientRadialFillStyle';
GraphicsCommandType.STROKE_RAD_GRD = 'gradientRadialStrokeStyle';

Graphics.pool = new ObjectPool(Graphics);

ColorHelper.lerpRGB = function (hex1, hex2, t) {
  const r = MathEx.lerp(hex1 >> 16 & 255, hex2 >> 16 & 255, t);
  const g = MathEx.lerp(hex1 >> 8 & 255, hex2 >> 8 & 255, t);
  const b = MathEx.lerp(hex1 & 255, hex2 & 255, t);

  return r << 16 | g << 8 | b;
}

MathEx.shortAngleDist = function (a0, a1) {
  let max = Math.PI * 2;
  let da = (a1 - a0) % max;
  return 2 * da % max - da;
};

MathEx.rndPick = function (array) {
  const rndIndex = Math.ceil(array.length * Math.random()) % array.length;

  return array[rndIndex];
};

MathEx.rndBool = function () {
  return Math.random() > 0.5;
};

JSONAsset.prototype.onLoaderRequested = function (factory) {
  this.mXHR = factory.get('xhr', this.mUrl);
  this.mXHR.mimeType = 'application/json';
  this.mXHR.responseType = 'json';
  this.addLoader(this.mXHR);
}

JSONAsset.prototype.onAllLoaded = function () {
  this.ready(this.mXHR.data);
}

Stage.prototype.onUpdate = function () {
  let size = Black.engine.viewport.size;

  if (this.mCacheWidth !== size.width || this.mCacheHeight !== size.height) {
    this.mCacheWidth = size.width;
    this.mCacheHeight = size.height;

    this.__refresh();

    setTimeout(() => this.__refresh(), 30);
  }
};

Graphics.prototype.onUpdate = function (x0, y0, r0, x1, y1, r1) {
  return new GraphicsRadialGradient(x0, y0, r0, x1, y1, r1);
};

Graphics.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
  return new GraphicsRadialGradient(x0, y0, r0, x1, y1, r1);
};

Graphics.prototype.strokeGradient = function (gradient) {
  this.mGraphicsData.strokeGradient(gradient);
};

GraphicsData.prototype.fillGradient = function (gradient) {
  if (gradient instanceof GraphicsLinearGradient) {
    this.__pushCommand(GraphicsCommandType.FILL_GRD, (gradient));
  } else if (gradient instanceof GraphicsRadialGradient) {
    this.__pushCommand(GraphicsCommandType.FILL_RAD_GRD, (gradient));
  }
};

GraphicsData.prototype.strokeGradient = function (gradient) {
  if (gradient instanceof GraphicsLinearGradient) {
    // this.__pushCommand(GraphicsCommandType.FILL_GRD, (gradient));
  } else if (gradient instanceof GraphicsRadialGradient) {
    this.__pushCommand(GraphicsCommandType.STROKE_RAD_GRD, (gradient));
  }
};

GraphicsRendererCanvas.prototype.__renderNode = function (driver, color, node, transform) {
  const commands = node.mCommandQueue;
  const ctx = driver.context;
  const len = commands.length;
  const r = driver.renderScaleFactor;
  const px = node.mPivotX;
  const py = node.mPivotY;

  transform = transform.clone().append(node.mTransform);
  driver.setTransform(transform);

  for (let i = 0; i < len; i++) {
    const cmd = commands[i];

    switch (cmd.type) {
      case GraphicsCommandType.LINE_STYLE: {
        ctx.lineWidth = cmd.getNumber(0) * r;
        ctx.strokeStyle = ColorHelper.intToRGBA(color === null ? cmd.getNumber(1) : /** @type {number} */(color), cmd.getNumber(2));
        ctx.lineCap = cmd.getString(3);
        ctx.lineJoin = cmd.getString(4);
        ctx.miterLimit = cmd.getNumber(5);
        break;
      }

      case GraphicsCommandType.FILL_STYLE: {
        ctx.fillStyle = ColorHelper.intToRGBA(color === null ? cmd.getNumber(0) : /** @type {number} */(color), cmd.getNumber(1));
        break;
      }

      case GraphicsCommandType.FILL_GRD: {
        const gradientInfo = /** @type {GraphicsLinearGradient} */(cmd.getObject(0));
        let grd = gradientInfo.native;

        if (!grd) {
          const dpr = Black.driver.renderScaleFactor;
          const entries = [];

          grd = gradientInfo.native = ctx.createLinearGradient(gradientInfo.x0 * dpr, gradientInfo.y0 * dpr,
            gradientInfo.x1 * dpr, gradientInfo.y1 * dpr);

          for (let key in gradientInfo.stops) {
            entries.push({ percent: parseFloat(key), color: gradientInfo.stops[key] });
          }

          entries.sort((a, b) => a.percent - b.percent);

          for (let i = 0, l = entries.length; i < l; i++) {
            const entry = entries[i];
            grd.addColorStop(entry.percent, entry.color);
          }
        }

        ctx.fillStyle = /** @type {CanvasGradient} */(grd);

        break;
      }

      case GraphicsCommandType.FILL_RAD_GRD: {
        const gradientInfo = /** @type {GraphicsRadialGradient} */(cmd.getObject(0));
        let grd = gradientInfo.native;


        if (!grd) {
          const dpr = Black.driver.renderScaleFactor;
          const entries = [];

          grd = gradientInfo.native = ctx.createRadialGradient(
            gradientInfo.x0 * dpr, gradientInfo.y0 * dpr, gradientInfo.r0 * dpr,
            gradientInfo.x1 * dpr, gradientInfo.y1 * dpr, gradientInfo.r1 * dpr
          );

          for (let key in gradientInfo.stops) {
            entries.push({ percent: parseFloat(key), color: gradientInfo.stops[key] });
          }

          entries.sort((a, b) => a.percent - b.percent);

          for (let i = 0, l = entries.length; i < l; i++) {
            const entry = entries[i];

            grd.addColorStop(entry.percent, entry.color);
          }
        }

        ctx.fillStyle = /** @type {CanvasGradient} */(grd);

        break;
      }

      case GraphicsCommandType.STROKE_RAD_GRD: {
        const gradientInfo = /** @type {GraphicsRadialGradient} */(cmd.getObject(0));
        let grd = gradientInfo.native;

        if (!grd) {
          const dpr = Black.driver.renderScaleFactor;
          const entries = [];

          grd = gradientInfo.native = ctx.createRadialGradient(
            gradientInfo.x0 * dpr, gradientInfo.y0 * dpr, gradientInfo.r0 * dpr,
            gradientInfo.x1 * dpr, gradientInfo.y1 * dpr, gradientInfo.r1 * dpr
          );

          for (let key in gradientInfo.stops) {
            entries.push({ percent: parseFloat(key), color: gradientInfo.stops[key] });
          }

          entries.sort((a, b) => a.percent - b.percent);

          for (let i = 0, l = entries.length; i < l; i++) {
            const entry = entries[i];

            grd.addColorStop(entry.percent, entry.color);
          }
        }

        ctx.strokeStyle = /** @type {CanvasGradient} */(grd);

        break;
      }

      case GraphicsCommandType.FILL_PATTERN: {
        const patternInfo = /** @type {GraphicsPattern} */(cmd.getObject(0));
        let pattern = patternInfo.native;

        if (!pattern) {
          pattern = patternInfo.native = ctx.createPattern(patternInfo.image, patternInfo.repetition);
        }

        ctx.fillStyle = /** @type {CanvasPattern} */(pattern);

        break;
      }

      case GraphicsCommandType.ARC: {
        ctx.arc(cmd.getNumber(0) * r - px, cmd.getNumber(1) * r - py, cmd.getNumber(2) * r, cmd.getNumber(3), cmd.getNumber(4), cmd.getBoolean(5));
        break;
      }

      case GraphicsCommandType.RECT: {
        ctx.rect(cmd.getNumber(0) * r - px, cmd.getNumber(1) * r - py, cmd.getNumber(2) * r, cmd.getNumber(3) * r);
        break;
      }

      case GraphicsCommandType.ROUNDED_RECT: {
        const x = cmd.getNumber(0);
        const y = cmd.getNumber(1);
        const width = cmd.getNumber(2);
        const height = cmd.getNumber(3);
        const radius = cmd.getNumber(4);

        ctx.moveTo(x * r - px, (y + radius) * r - py);
        ctx.quadraticCurveTo(x * r - px, y * r - py, (x + radius) * r - px, y * r - py);
        ctx.lineTo((x + width - radius) * r - px, y * r - py);
        ctx.quadraticCurveTo((x + width) * r - px, y * r - py, (x + width) * r - px, (y + radius) * r - py);
        ctx.lineTo((x + width) * r - px, (y + height - radius) * r - py);
        ctx.quadraticCurveTo((x + width) * r - px, (y + height) * r - py, (x + width - radius) * r - px, (y + height) * r - py);
        ctx.lineTo((x + radius) * r - px, (y + height) * r - py);
        ctx.quadraticCurveTo(x * r - px, (y + height) * r - py, x * r - px, (y + height - radius) * r - py);
        ctx.closePath();
        break;
      }

      case GraphicsCommandType.BEZIER_CURVE_TO: {
        ctx.bezierCurveTo(cmd.getNumber(0) * r - px, cmd.getNumber(1) * r - py, cmd.getNumber(2) * r - px, cmd.getNumber(3) * r - py, cmd.getNumber(4) * r - px, cmd.getNumber(5) * r - py);
        break;
      }
      case GraphicsCommandType.QUADRATIC_CURVE_TO: {
        ctx.quadraticCurveTo(cmd.getNumber(0) * r - px, cmd.getNumber(1) * r - py, cmd.getNumber(2) * r - px, cmd.getNumber(3) * r - py);
        break;
      }
      case GraphicsCommandType.BEGIN_PATH: {
        ctx.beginPath();
        break;
      }
      case GraphicsCommandType.CLOSE_PATH: {
        ctx.closePath();
        break;
      }
      case GraphicsCommandType.FILL: {
        ctx.fill(cmd.getBoolean(0) === true ? 'nonzero' : 'evenodd');
        break;
      }

      case GraphicsCommandType.LINE_TO: {
        ctx.lineTo(cmd.getNumber(0) * r - px, cmd.getNumber(1) * r - py);
        break;
      }

      case GraphicsCommandType.MOVE_TO: {
        ctx.moveTo(cmd.getNumber(0) * r - px, cmd.getNumber(1) * r - py);
        break;
      }

      case GraphicsCommandType.LINE_DASH: {
        ctx.setLineDash(cmd.getNumber(0));
        break;
      }

      case GraphicsCommandType.STROKE: {
        ctx.stroke();
        break;
      }

      case GraphicsCommandType.BOUNDS: {
        break;
      }

      default:
        Debug.error(`Unsupported canvas command '${cmd.type}'.`);
        break;
    }
  }

  for (let i = 0, l = node.mNodes.length; i < l; i++) {
    this.__renderNode(driver, color, node.mNodes[i], transform);
  }
};