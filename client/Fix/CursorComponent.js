import { Component, Black } from "black-engine";

export default class CursorComponent extends Component {
  onAdded() {
    let lastObject = null;

    this.gameObject.on("pointerMove", (_, pointerInfo) => {
      if (lastObject !== pointerInfo.activeObject) {
        pointerInfo.activeObject.post("pointerIn");

        lastObject && lastObject.post("pointerOut");

        lastObject = pointerInfo.activeObject;
      }

      if (pointerInfo.activeObject.isButton) {
        Black.driver.context.canvas.style.cursor = "pointer";
      } else {
        Black.driver.context.canvas.style.cursor = "default";
      }
    });
  }
}