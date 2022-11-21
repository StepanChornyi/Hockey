import { Black, Graphics, TextField } from "black-engine";
import FixedSizeDisplayObject from "../../Fix/FixedSizeDisplayObject";
import GameModel from "../../GameModel";
import InputPopup from "../../InputPopup";
import AbstractScreen from "../AbstractScreen";
import Button from "./Button";
import ListItem from "./ListItem";
import ItemsList from "./ItemsList";
import ScrollComponent from "./ScrollComponent";
import { C_JOIN_MATCH, S_MATCHES_LIST, S_PLAYERS_LIST } from "../../../Protocol";
import PlayersList from "./PlayersList";

const MENU_WIDTH = 640;
const SIDE_OFFSET = 10;

export default class MainMenuScreen extends AbstractScreen {
  constructor(socket, dispatchMessage) {
    super(socket, dispatchMessage);

    this.name = "MainMenuScreen";

    const itemsList = this._itemsList = new ItemsList();

    this._scrollComponent = itemsList.addComponent(new ScrollComponent());

    itemsList.on("joinPressed", (_, matchId) => {
      this.post('~server', C_JOIN_MATCH, { matchId: parseInt(matchId) });
      // socket.emit(C_JOIN_MATCH, gameId);
    });


    // socket.on(S_MATCHES_LIST, (data) => itemsList.setItems(JSON.parse(data)));
    // socket.on(S_PLAYERS_LIST, (data) => playersList.setPlayers(JSON.parse(data)));

    const btnNewGame = this._btnNewGame = new Button("Create Game", Button.GREEN, 200, 50);
    const playerNickname = this._playerNickname = new TextField(GameModel.nickname || "nickname", "Arial", 0xffffff, 50);
    const headerBg = this._headerBg = this._createHeaderBg();
    const playersList = this._playersList = new PlayersList();

    this.add(playersList, itemsList, headerBg, playerNickname, btnNewGame);

    GameModel.on('nicknameChanged', () => {
      playerNickname.text = GameModel.nickname || "nickname";
      this._alignElements();
    });

    playerNickname.touchable = true;
    playerNickname.isButton = true;
    playerNickname.on("pointerDown", () => InputPopup.showEnterNicknamePopup());

    // btnNewGame.on("pressed", () => InputPopup.showNewGamePopup());
    btnNewGame.on("pressed", () => this.post("createGame"));

    Black.stage.on("resize", this._alignElements.bind(this)).callback();
  }

  processMessage(msg, data) {
    switch (msg) {
      case S_MATCHES_LIST:
        GameModel.matches = JSON.parse(data);

        this._itemsList.setItems(GameModel.matches)
        break;
      case S_PLAYERS_LIST:
        GameModel.players = JSON.parse(data);

        this._playersList.setPlayers(GameModel.players);
        break;
    }
  }

  _alignElements() {
    const stage = Black.stage;
    const stageBounds = stage.getBounds();

    const btnNewGame = this._btnNewGame;
    const playerNickname = this._playerNickname;
    const headerBg = this._headerBg;

    playerNickname.alignAnchor(0, 0.45)
    playerNickname.x = SIDE_OFFSET;
    playerNickname.y = stageBounds.top + playerNickname.height * 0.5 + SIDE_OFFSET;

    btnNewGame.alignAnchor(1, 0.5)
    btnNewGame.x = MENU_WIDTH - SIDE_OFFSET;
    btnNewGame.y = stageBounds.top + btnNewGame.height * 0.5 + SIDE_OFFSET;

    btnNewGame.y = playerNickname.y = Math.max(btnNewGame.y, playerNickname.y);

    const headerBottom = Math.max(playerNickname.y + playerNickname.height * 0.5, btnNewGame.y + btnNewGame.height * 0.5) + SIDE_OFFSET;
    const headerHeight = headerBottom - stageBounds.top;

    headerBg.x = stageBounds.left;
    headerBg.y = stageBounds.top;
    this._drawHeaderBg(stageBounds.width, headerBottom - stageBounds.top);

    this._scrollComponent.topOffset = headerHeight;

    this._playersList.x = stageBounds.left;
    this._playersList.y = stageBounds.bottom;
  }

  _drawHeaderBg(width, height) {
    const g = this._headerBg;

    g.clear();

    g.fillStyle(0x111111, 0.8);
    g.beginPath();
    g.rect(0, 0, width, height);
    g.closePath();
    g.fill();

    g.lineStyle(2, 0x4a3da1);
    g.beginPath();
    g.moveTo(0, height - 1);
    g.lineTo(width, height - 1);
    g.stroke();
    g.closePath();
  }

  _createHeaderBg() {
    const g = new Graphics();

    g.touchable = true;

    return g;
  }
}