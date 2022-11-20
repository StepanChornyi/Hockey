import { MessageDispatcher } from "black-engine";

import GameModel from "./GameModel";

const PopupName = {
  None: '',
  ConnectionLost: 'ConnectionLost',
  OpponentDisconnected: 'OpponentDisconnected',
  WaitingForOpponent: 'WaitingForOpponent',
  EnterNickname: 'EnterNickname',
  NewGame: 'NewGame'
};

class InputPopup extends MessageDispatcher {
  constructor() {
    super();

    this._enterCallback = null;

    window.addEventListener("keydown", (evt) => {
      if (!this._enterCallback)
        return;

      switch (evt.key) {
        case "Enter":
          this._enterCallback();
          break;
        case "Escape":
          this.hide();
          break;
      }
    });

    this.showedPopupName = "";
  }

  showConnectionLost() {
    if (!this._updatePopup(PopupName.ConnectionLost))
      return;

    this._showPopup(this.createWaitPopup("Server not responding...", true));
  }

  showOpponentDisconnected() {
    if (!this._updatePopup(PopupName.OpponentDisconnected))
      return;

    const buttonHtml = `<button class="button buttonRed marginTop" id="leaveGameBtn">Leave Game</button>`;

    this._showPopup(this.createWaitPopup("Opponent lost connection... waiting", true, buttonHtml));

    const btn = document.getElementById("leaveGameBtn");

    btn.addEventListener("click", () => {
      this.post("leaveBtnClicked");
      this.hide();
    });
  }

  showWaitingForOpponent() {
    if (!this._updatePopup(PopupName.WaitingForOpponent))
      return;

    const buttonHtml = `<button class="button buttonRed marginTop" id="leaveGameBtn">Cancel Game</button>`;

    this._showPopup(this.createWaitPopup("Waiting for opponent", true, buttonHtml));

    const btn = document.getElementById("leaveGameBtn");

    btn.addEventListener("click", () => {
      this.post("leaveBtnClicked");
      this.hide();
    });
  }

  showEnterNicknamePopup(showCloseBtn = true) {
    if (!this._updatePopup(PopupName.EnterNickname))
      return;

    const btnEnter = this._showInputPopup("Enter Nickname", "nickname", showCloseBtn && "Cancel", "Save");

    if (GameModel.nickname) {
      document.getElementById("myInput").value = GameModel.nickname;
    }

    this._enterCallback = this._enterNickname.bind(this);

    btnEnter.addEventListener("click", this._enterCallback);
  }

  showNewGamePopup() {
    if (!this._updatePopup(PopupName.NewGame))
      return;

    const btnEnter = this._showInputPopup("Create new game?", null, "Cancel", "Create");

    this._enterCallback = this._enterCreateGame.bind(this);

    btnEnter.addEventListener("click", this._enterCallback);
  }

  hide() {
    const container = document.getElementById("popupContainer");

    container.style.display = "none";
    container.innerHTML = "";

    // this.off("nickname");
    this.off("newGame");

    this._updatePopup(PopupName.None);

    this._enterCallback = null;
  }

  _addInputDefaultText(defaultVal) {
    const input = document.getElementById("myInput");

    input.value = defaultVal;

    input.addEventListener("click", () => {
      if (document.getElementById("myInput").value === defaultVal) {
        document.getElementById("myInput").value = "";
      }
    });
  }

  _enterNickname() {
    const inputVal = this._getInputVal();

    if (!inputVal)
      return;

    this.hide();
    this.post("nickname", inputVal);
  }

  _enterCreateGame() {
    this.hide();
    this.post("createGame");
  }

  _getInputVal() {
    const input = document.getElementById("myInput");

    return (input && input.value.length > 1) ? input.value : null;
  }

  _showInputPopup(title, placeholder, btnClose, btnEnter) {
    this._showPopup(this.createInputPopup(title, placeholder, btnClose, btnEnter));

    btnClose = document.getElementById("closeBtn");
    btnClose && btnClose.addEventListener("click", this.hide.bind(this));

    return document.getElementById("enterBtn");
  }

  _showPopup(popupHTML) {
    const container = document.getElementById("popupContainer");

    container.style.display = "block";
    container.innerHTML = popupHTML;
  }

  _updatePopup(popupName) {
    if (this.showedPopupName === popupName)
      return false;

    this.showedPopupName = popupName;

    return true;
  }

  createInputPopup(title, placeholder, btnClose, btnEnter) {
    return `
    <div class="popupWrapper">
      <div class="popup">
        <p class="popupTitle">${title}</p>
        ${placeholder ? `<input id="myInput" autocomplete="off" placeholder="${placeholder}">` : ""}
        <div class="buttonsWrapper">
        ${btnClose ? `<button accesskey="g" class="button buttonRed" id="closeBtn">${btnClose}</button>` : ""}
        ${btnEnter ? `<button class="button buttonGreen"  id="enterBtn">${btnEnter}</button>` : ""}
        </div>
      </div>
    </div>
    `;
  }

  createWaitPopup(title, showSpinner, button = "") {
    return `
    <div class="popupWrapper">
      <div class="popup popupSmall">
        <p class="popupTitle popupTitleSmall">${title}</p>
        ${showSpinner ? `<div class="lds-dual-ring"></div>` : ""}
        ${button}
      </div>
    </div>
    `;
  }
}

InputPopup = new InputPopup();

export default InputPopup;

