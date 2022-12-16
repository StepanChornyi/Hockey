import { DisplayObject, Black, MathEx, Graphics, GraphicsData, Tween, ColorHelper, CapsStyle, Ease, HSV } from 'black-engine';
import { GATES_SIZE } from '../BoardConfig';

export default class ScoreView extends DisplayObject {
  constructor(color) {
    super();

    this._config = ScoreView.getConfig(1);
    this._color = color;

    this._origHsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(color));
    this._maxHsv = new HSV(this._origHsv.h, 0.3, 1);
    this._currHsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(color));

    this._graphicsData = new GraphicsData();
    this._view = this.addChild(new Graphics(this._graphicsData));

    this._currentScore = 0;
    this._maxScore = 1;
    this._colorT = 0;

    this.setMaxScore(this._maxScore);
    this.setScore(0, false);
  }

  setMaxScore(maxScore) {
    this._maxScore = maxScore;
    this._config = ScoreView.getConfig(maxScore);

    const { LINE_WIDTH, DASH_SIZE, DASH_OFFSET, ARC_RADIUS } = this._config;

    const graphicsData = this._graphicsData;

    graphicsData.clear();

    graphicsData.setLineDash([DASH_SIZE, DASH_OFFSET])

    this._lineDashCommand = graphicsData.mCommandQueue[graphicsData.mCommandQueue.length - 1];

    graphicsData.lineStyle(LINE_WIDTH, ColorHelper.rgb2hex(ColorHelper.hsv2rgb(this._currHsv)), 1, CapsStyle.ROUND);

    this._lineStyleCommand = graphicsData.mCommandQueue[graphicsData.mCommandQueue.length - 1];

    graphicsData.beginPath();
    graphicsData.arc(0, 0, ARC_RADIUS, -Math.PI, 0);

    this._arcCommand = graphicsData.mCommandQueue[graphicsData.mCommandQueue.length - 2];

    graphicsData.stroke();
    graphicsData.closePath();
    graphicsData.setLineDash([]);

    this._lineStyleCommand.data[2] = 0;
  }

  setScore(score, anim = this.score !== score) {
    this._view.visible = score > 0;

    if (!anim) {
      this.colorT = 0;
      this.score = score;

      return;
    }

    this.colorT = 0;

    this._view.scaleX *= -1;

    this._lineWidthTw = this.addComponent(new Tween({
      _lineWidth: 6,
      colorT: 1
    }, 0.15, {
      yoyo: true,
      playOnAdded: true,
      repeats: 1
    }));

    this.addComponent(new Tween({
      score,
    }, 0.3, {
      playOnAdded: true,
      ease: (t) => Ease.cubicIn(Ease.backOut(t))
    }));
  }

  get _lineWidth() {
    return this._lineStyleCommand.data[0];
  }

  set _lineWidth(val) {
    this._lineStyleCommand.data[0] = val;
  }

  get colorT() {
    return this._colorT;
  }

  set colorT(t) {
    this._currHsv.h = MathEx.lerp(this._origHsv.h, this._maxHsv.h, t);
    this._currHsv.s = MathEx.lerp(this._origHsv.s, this._maxHsv.s, t);
    this._currHsv.v = MathEx.lerp(this._origHsv.v, this._maxHsv.v, t);
    this._colorT = t;

    this._lineStyleCommand.data[2] = 1// 0.5 + t * 0.5;//alpha

    this._lineDashCommand.data[1] = (1 - t) * this._config.DASH_OFFSET
    this._lineStyleCommand.data[1] = ColorHelper.rgb2hex(ColorHelper.hsv2rgb(this._currHsv));
  }

  get score() {
    return this._currentScore;
  }

  set score(val) {
    const { DASH_ANGLE_SIZE, DASH_OFFSET_ANGLE_SIZE } = this._config;

    const angleCenter = -Math.PI * 0.5;
    const halfArcAngleSize = Math.min(Math.PI * 0.5, (val * DASH_ANGLE_SIZE + Math.max(0, val - 1) * DASH_OFFSET_ANGLE_SIZE) * 0.5)

    this._arcCommand.data[3] = angleCenter - halfArcAngleSize;
    this._arcCommand.data[4] = angleCenter + halfArcAngleSize;

    this._currentScore = val;
  }

  static getConfig(MAX_SCORE) {
    const LINE_WIDTH = 2;
    const ARC_RADIUS = GATES_SIZE * 0.5;
    const ARC_SIZE = Math.PI * ARC_RADIUS;
    const DASH_OFFSET = 5;
    const DASH_SIZE = (ARC_SIZE - DASH_OFFSET * MAX_SCORE) / MAX_SCORE;
    const DASH_ANGLE_SIZE = DASH_SIZE / ARC_RADIUS;
    const DASH_OFFSET_ANGLE_SIZE = Math.asin(DASH_OFFSET / ARC_RADIUS);

    const RENDER_SCALE = Black.engine.mVideo.renderScaleFactor;

    return {
      LINE_WIDTH,
      ARC_RADIUS,
      ARC_SIZE,
      DASH_OFFSET: DASH_OFFSET * RENDER_SCALE,
      DASH_SIZE: DASH_SIZE * RENDER_SCALE,
      DASH_ANGLE_SIZE,
      DASH_OFFSET_ANGLE_SIZE,
    }
  }
}