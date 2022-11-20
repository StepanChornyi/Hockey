import { DisplayObject, Black, MathEx, Graphics, GraphicsData, Tween, ColorHelper, CapsStyle, Ease, HSV } from 'black-engine';
import { BOARD_WIDTH, GATES_SIZE, WALL_WIDTH } from '../BoardConfig';
import ScoreView from './ScoreView';

export default class ScoreWinLine extends DisplayObject {
  constructor(maxScore = 3) {
    super();

    this._config = ScoreView.getConfig(maxScore);
    this._points = [];

    const color = 0xeb3446;

    const { LINE_WIDTH, DASH_SIZE, DASH_OFFSET, ARC_RADIUS } = this._config;

    // this.alpha = 0.5;

    this.setColor(color); 

    const graphicsData = new GraphicsData();

    graphicsData.setLineDash([DASH_SIZE, DASH_OFFSET])

    this._lineDashCommand = graphicsData.mCommandQueue[graphicsData.mCommandQueue.length - 1];

    graphicsData.lineStyle(LINE_WIDTH, ColorHelper.rgb2hex(ColorHelper.hsv2rgb(this._currHsv)), 1, CapsStyle.ROUND);

    this._lineStyleCommand = graphicsData.mCommandQueue[graphicsData.mCommandQueue.length - 1];

    const LINE_LENGTH = BOARD_WIDTH - WALL_WIDTH;

    graphicsData.beginPath();
    graphicsData.moveTo(-LINE_LENGTH * 0.5, 0);
    graphicsData.lineTo(LINE_LENGTH * 0.5, 0);

    // this._arcCommand = graphicsData.mCommandQueue[graphicsData.mCommandQueue.length - 2];

    graphicsData.stroke();
    graphicsData.closePath();
    graphicsData.setLineDash([])

    this._lineStyleCommand.data[2] = 0;

    this._view = this.addChild(new Graphics(graphicsData));

    this._currentScore = 0;
    this._colorT = 0;

    this.visible = false;

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

  // get score() {
  //   return this._currentScore;
  // }

  // set score(val) {
  //   const { DASH_ANGLE_SIZE, DASH_OFFSET_ANGLE_SIZE } = this._config;

  //   // const angleCenter = -Math.PI * 0.5;
  //   // const halfArcAngleSize = (val * DASH_ANGLE_SIZE + Math.max(0, val - 1) * DASH_OFFSET_ANGLE_SIZE) * 0.5

  //   // this._arcCommand.data[3] = angleCenter - halfArcAngleSize;
  //   // this._arcCommand.data[4] = angleCenter + halfArcAngleSize;

  //   this._currentScore = val;
  // }

  setColor(color) {
    this._origHsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(color));
    this._maxHsv = new HSV(this._origHsv.h, 0.3, 1);
    this._currHsv = ColorHelper.rgb2hsv(ColorHelper.hex2rgb(color));
  }


  show(color) {
    this.setColor(color); 

    this.visible = true;
    this.colorT = 0;

    this._lineWidthTw = this.addComponent(new Tween({
      _lineWidth: 4,
      colorT: 1
    }, 0.05, {
      yoyo: true,
      playOnAdded: true,
      repeats: 5
    }));

    // this.addComponent(new Tween({
    //   score,
    // }, 0.3, {
    //   playOnAdded: true,
    //   ease: (t) => Ease.cubicIn(Ease.backOut(t))
    // }));
  }
}