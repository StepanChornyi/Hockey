import { Black, Vector, DisplayObject, Component } from "black-engine";
import GameModel from "../../GameModel";
import ListItem from "./ListItem";

export default class ItemsList extends DisplayObject {
  constructor() {
    super();

    this._items = [];
    this._itemsPool = [];

    this.touchable = true;
  }

  setItems(data) {
    while (this._items.length > data.length) {
      const item = this._items.pop();

      this.removeChild(item);

      this._itemsPool.push(item);
    }

    for (let i = 0; i < data.length; i++) {
      const itemConfig = data[i];

      const item = this._items[i] || this._itemsPool.pop() || new ListItem();

      item.setData(this._getItemConfig(itemConfig));
      item.off("joinPressed");
      item.once("joinPressed", () => this.post("joinPressed", itemConfig.id));

      if (!this._items[i]) {
        this._items.push(item);
        this.addChild(item);
      }
    }

    for (let i = 0, lastY = 0; i < this._items.length; i++) {
      const item = this._items[i];

      item.y = lastY;

      lastY += item.height;
    }
  }

  _getItemConfig(data) {
    const playerA = GameModel.getPlayerById(data.players[0]);
    const playerB = GameModel.getPlayerById(data.players[1]);

    return {
      playerA: playerA ? playerA.name : 'error',
      playerB: playerB ? playerB.name : 'error',
      isWaiting: data.isWaiting
    }
  }
}