import { DisplayObject } from 'black-engine';

export default class AbstractScreen extends DisplayObject {
  constructor(socket, dispatchMessage) {
    super();

    this.touchable = true;

    this.name = "AbstractScreen";

    this._socket = socket;

    this.on('server', (_, msg, data) => dispatchMessage(msg, data, this));
  }

  get socket() {
    return this._socket;
  }

  precessMessage(msg, data) { }
}