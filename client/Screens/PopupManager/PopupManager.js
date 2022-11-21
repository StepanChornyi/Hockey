import { DisplayObject, Black } from 'black-engine';
import BaseScene from '../../Lib/BaseScene';
import BasePopup from './Popups/BasePopup';
import CreateGamePopup from './Popups/CreateGamePopup';
import WaitingOpponentPopup from './Popups/WaitingOpponentPopup';

const POPUPS_TO_INIT = [
  CreateGamePopup,
  WaitingOpponentPopup
];

export default class PopupManager extends BaseScene {
  constructor() {
    super();

    this.name = "PopupManager";

    this.touchable = true;
    this.visible = false;

    this._overlay.touchable = true;

    this._popupContainer = this.addChild(new DisplayObject());
    this._popupContainer.touchable = true;

    this._popups = [];

    for (let i = 0; i < POPUPS_TO_INIT.length; i++) {
      const popup = new POPUPS_TO_INIT[i]();

      popup.on("close", () => this.hide());

      this._popups.push(popup)
    }

    // this._popupContainer.addChild(this._popups[this._popups.length - 1])

    Black.stage.on("resize", this._onResize.bind(this)).callback();
  }

  showPopup(popupName) {
    const popup = this._getPopupByName(popupName);

    if (!popup) {
      return console.warn(`Popup with name "${popupName}" does not exist!`);
    }

    this.visible = true;

    this._showOverlay();

    this.hideOldPopup(() => {
      this._popupContainer.addChild(popup).show();
    });
  }

  hide() {
    this._hideOverlay()

    this.hideOldPopup(() => {
      this.visible = false;
    })
  }

  hideOldPopup(onComplete = () => { }) {
    const popup = this._popupContainer.getChildAt(0);

    if (popup) {
      popup.hide().once("complete", () => {
        this._popupContainer.removeChild(popup);
        onComplete();
      });
    } else {
      this._popupContainer.removeAllChildren();
      onComplete();
    }
  }

  _getPopupByName(popupName) {
    for (let i = 0; i < this._popups.length; i++) {
      if (this._popups[i].name === popupName)
        return this._popups[i];
    }

    return null;
  }

  _onResize() {
    const stage = Black.stage;
    const stageBounds = stage.getBounds();

    this.onResize(stageBounds);

    this._popupContainer.x = stageBounds.center().x;
    this._popupContainer.y = stageBounds.center().y;
  }
}

PopupManager.CreateGamePopup = CreateGamePopup.NAME;
PopupManager.WaitingOpponentPopup = WaitingOpponentPopup.NAME;