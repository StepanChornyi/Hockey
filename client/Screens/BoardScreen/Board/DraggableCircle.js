import { Black, Graphics, Vector } from 'black-engine';

export default class DraggableCircle extends Graphics {
  constructor(color = 0xffffff, radius = 10) {
    super();

    this.alpha = 0//0.3;

    this.touchable = true;

    this.lineStyle(1, color, 0.3)
    this.fillStyle(0xffffff, 0.1);
    this.beginPath();
    this.circle(0, 0, radius);
    this.closePath();
    this.stroke();
    this.fill();

    this._clickPos = null;
    this._dragging = false;

    this._pointerId = -1;

    this.on("pointerDown", (_, pointer) => {
      this._pointerId = pointer.id;

      this._clickPos = this.globalToLocal(Black.input.pointerPosition);
      this._dragging = true;
    });

    this.on("pointerUp", (_, pointer) => {
      if (pointer.id !== this._pointerId)
        return;

      this._dragging = false;
      this._pointerId = -1;
    });
  }
  
  updateDrag() {
    if (!this._dragging)
      return;

    const parentPos = this.parent.globalToLocal(Black.input.pointerPosition);

    this.x = parentPos.x - this._clickPos.x + this.pivotX;
    this.y = parentPos.y - this._clickPos.y + this.pivotY;
  }

  get isDragging(){
    return this._dragging;
  }
}