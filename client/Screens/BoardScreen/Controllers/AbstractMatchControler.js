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
    this._twObject.sensitivity = 0;
    this._twObject.resetVal = 0;
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

  changeResetValue(target, dur, initial = null) {
    this.__animVal("resetVal", { target, dur, initial });
  }

  changeFreezeValue(target, dur, initial = null) {
    this.__animVal("freeze", { target, dur, initial });
  }

  changeSensitivityValue(target, dur, initial = null) {
    this.__animVal("sensitivity", { target, dur, initial });
  }

  __animVal(valName, { dur, initial, target }) {
    const obj = this._twObject;

    if (this._tweens[valName])
      obj.removeComponent(this._tweens[valName]);

    if (initial !== null)
      obj[valName] = initial;

    return this._tweens[valName] = obj.addComponent(new Tween({ [valName]: target }, dur));
  }

  get resetVal() {
    return this._twObject.resetVal;
  }

  set resetVal(val) {
    this._twObject.resetVal = val;
  }

  get sensitivity() {
    return this._twObject.sensitivity;
  }

  set sensitivity(val) {
    this._twObject.sensitivity = val;
  }

  get freeze() {
    return this._twObject.freeze;
  }

  set freeze(val) {
    this._twObject.freeze = val;
  }
}