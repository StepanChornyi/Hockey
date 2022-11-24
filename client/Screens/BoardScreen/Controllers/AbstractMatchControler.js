import { Black, Component, Graphics } from "black-engine";

export default class AbstractMatchController extends Component {
  constructor(board, boardSim) {
    super();

    this._board = board;
    this._boardSim = boardSim;
  }

  processMessage(msg, data) { }
}