import { Black, Component, GameObject, Graphics, Tween } from "black-engine";
import Utils from "../../../Utils";

export default class AbstractMatchController extends Component {
  constructor(board, boardSim) {
    super();

    this._board = board;
    this._boardSim = boardSim;

    this._tweens = {};
    this._twObject = new GameObject();
    this._twObject.freeze = 0;
    this._twObject.sensitivityA = 0;
    this._twObject.sensitivityB = 0;
    this._twObject.resetValA = 0;
    this._twObject.resetValB = 0;
  }

  processMessage(msg, data) { }

  onAdded(gameObject) {
    gameObject.addChild(this._twObject);
  }

  onRemoved(gameObject) {
    gameObject.removeChild(this._twObject);

    Utils.removeAllComponents(this._twObject);

    this._tweens = {};
  }

  _raiseSensitivity() {
    this._raiseSensitivityA();
    this._raiseSensitivityB();
  }

  _lowerSensitivity() {
    this._lowerSensitivityA();
    this._lowerSensitivityB();
  }

  _raiseResetVal() {
    this._raiseResetValA();
    this._raiseResetValB();
  }

  _raiseSensitivityA() {
    this.__animVal("sensitivityA", RAISE_SENS_CFG);
  }

  _lowerSensitivityA() {
    this.__animVal("sensitivityA", LOWER_SENS_CFG);
  }

  _raiseResetValA() {
    this.__animVal("resetValA", RAISE_RESET_VAL_CFG);
  }

  _lowerResetValA() {
    this.__animVal("resetValA", LOWER_RESET_VAL_CFG);
  }

  _raiseSensitivityB() {
    this.__animVal("sensitivityB", RAISE_SENS_CFG);
  }

  _lowerSensitivityB(target = LOWER_SENS_CFG.target) {
    const cfg = { ...LOWER_SENS_CFG };

    cfg.target = target;

    this.__animVal("sensitivityB", cfg);
  }

  _raiseResetValB() {
    this.__animVal("resetValB", RAISE_RESET_VAL_CFG);
  }

  _lowerResetValB() {
    this.__animVal("resetValB", LOWER_RESET_VAL_CFG);
  }

  _raiseFreeze() {
    this.__animVal("freeze", RAISE_FREEZE_CFG);
  }

  _lowerFreeze() {
    this.__animVal("freeze", LOWER_FREEZE_CFG);
  }

  __animVal(valName, { dur, initial, target }) {
    const obj = this._twObject;

    if (this._tweens[valName])
      obj.removeComponent(this._tweens[valName]);

    if (initial !== null)
      obj[valName] = initial;

    return this._tweens[valName] = obj.addComponent(new Tween({ [valName]: target }, dur));
  }

  set resetVal(val) {
    this.resetValA = val;
    this.resetValB = val;
  }

  set sensitivity(val) {
    this.sensitivityA = val;
    this.sensitivityB = val;
  }

  get resetValA() {
    return this._twObject.resetValA;
  }

  set resetValA(val) {
    this._twObject.resetValA = val;
  }

  get sensitivityA() {
    return this._twObject.sensitivityA;
  }

  set sensitivityA(val) {
    this._twObject.sensitivityA = val;
  }

  get resetValB() {
    return this._twObject.resetValB;
  }

  set resetValB(val) {
    this._twObject.resetValB = val;
  }

  get sensitivityB() {
    return this._twObject.sensitivityB;
  }

  set sensitivityB(val) {
    this._twObject.sensitivityB = val;
  }

  get freeze() {
    return this._twObject.freeze;
  }

  set freeze(val) {
    this._twObject.freeze = val;
  }
}

const RAISE_SENS_CFG = {
  dur: 0.2,
  initial: 0,
  target: 1
};

const LOWER_SENS_CFG = {
  dur: 0.9,
  initial: null,
  target: 0
};

const RAISE_RESET_VAL_CFG = {
  dur: 0.9,
  initial: 0,
  target: 1
};

const LOWER_RESET_VAL_CFG = {
  dur: 0.2,
  initial: null,
  target: 0
};

const RAISE_FREEZE_CFG = {
  dur: 0.2,
  initial: null,
  target: 1
};

const LOWER_FREEZE_CFG = {
  dur: 0.2,
  initial: null,
  target: 0
};