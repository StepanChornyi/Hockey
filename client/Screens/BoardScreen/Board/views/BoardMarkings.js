import { Graphics, CapsStyle } from 'black-engine';
import { BOARD_WIDTH, BOARD_HEIGHT, GATES_SIZE } from './../BoardConfig';

export default class BoardMarkings extends Graphics {
  constructor() {
    super();

    const r = GATES_SIZE * 0.5;
    const angleOffset = Math.PI * 0.03;

    this.lineStyle(2, 0xffffff, 0.3, CapsStyle.ROUND);

    this.beginPath();
    this.circle(BOARD_WIDTH * 0.5, BOARD_HEIGHT * 0.5, r);
    this.closePath();
    this.stroke();

    this.beginPath();
    this.moveTo(6, BOARD_HEIGHT * 0.5);
    this.lineTo(BOARD_WIDTH - 6, BOARD_HEIGHT * 0.5);
    this.stroke();
    this.closePath();

    this.beginPath();
    this.arc(BOARD_WIDTH * 0.5, 0, r, angleOffset, Math.PI - angleOffset)
    this.stroke();
    this.closePath();

    this.beginPath();
    this.arc(BOARD_WIDTH * 0.5, BOARD_HEIGHT, r, -angleOffset, Math.PI + angleOffset, true)
    this.stroke();
    this.closePath();
  }
}