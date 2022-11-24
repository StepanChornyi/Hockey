import { Rectangle, Vector } from 'black-engine';

const BOARD_WIDTH = 400;
const BOARD_HEIGHT = 600;
const BOARD_CENTER = new Vector(BOARD_WIDTH * 0.5, BOARD_HEIGHT * 0.5);
const GATES_SIZE = BOARD_WIDTH * 0.5;
const WALL_RADIUS = 4;
const WALL_WIDTH = WALL_RADIUS * 2;
const BALL_RADIUS = 15;
const PLAYER_RADIUS = 40;
const PLAYER_OFFSET = 0.1;
const BALL_MAX_SPEED = 1600;
const PLAYER_MAX_SPEED = BALL_MAX_SPEED * 0.95;

const PLAYER_A_BOX = new Rectangle(//top player
  PLAYER_RADIUS + WALL_RADIUS + PLAYER_OFFSET,
  PLAYER_RADIUS + WALL_RADIUS + PLAYER_OFFSET,
  BOARD_WIDTH - (PLAYER_RADIUS + WALL_RADIUS + PLAYER_OFFSET) * 2,
  BOARD_HEIGHT * 0.5 - (PLAYER_RADIUS + PLAYER_OFFSET) * 2 - WALL_RADIUS,
);

const PLAYER_B_BOX = new Rectangle(//bottom player
  PLAYER_RADIUS + WALL_RADIUS + PLAYER_OFFSET,
  BOARD_HEIGHT * 0.5 + PLAYER_RADIUS + PLAYER_OFFSET,
  BOARD_WIDTH - (PLAYER_RADIUS + WALL_RADIUS + PLAYER_OFFSET) * 2,
  BOARD_HEIGHT * 0.5 - (PLAYER_RADIUS + PLAYER_OFFSET) * 2 - WALL_RADIUS,
);

let ID = 0;

class WallConfig {
  constructor(ax, ay, bx, by, r, visible = true) {
    this.id = ++ID;
    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
    this.r = r;
    this.visible = visible;
  }
}

class CircleConfig {
  constructor(x, y, r) {
    this.id = ++ID;
    this.x = x;
    this.y = y;
    this.r = r;
  }
}

const WALLS_CONFIG = [
  new WallConfig(-15, 0, -15, BOARD_HEIGHT, 1, false),//left invisible
  new WallConfig(BOARD_WIDTH + 15, 0, BOARD_WIDTH + 15, BOARD_HEIGHT, 1, false),//right invisible

  new WallConfig(0, WALL_WIDTH, 0, BOARD_HEIGHT * 0.5 - WALL_WIDTH * 0.8, WALL_RADIUS),//left-top
  new WallConfig(0, BOARD_HEIGHT * 0.5 + WALL_WIDTH * 0.8, 0, BOARD_HEIGHT - WALL_WIDTH, WALL_RADIUS),//left-bottom

  new WallConfig(BOARD_WIDTH, WALL_WIDTH, BOARD_WIDTH, BOARD_HEIGHT * 0.5 - WALL_WIDTH * 0.8, WALL_RADIUS),//right-top
  new WallConfig(BOARD_WIDTH, BOARD_HEIGHT * 0.5 + WALL_WIDTH * 0.8, BOARD_WIDTH, BOARD_HEIGHT - WALL_WIDTH, WALL_RADIUS),//right-bottom

  new WallConfig(WALL_WIDTH, 0, BOARD_CENTER.x - GATES_SIZE * 0.5, 0, WALL_RADIUS),//top-left
  new WallConfig(BOARD_CENTER.x + GATES_SIZE * 0.5, 0, BOARD_WIDTH - WALL_WIDTH, 0, WALL_RADIUS),//top-right

  new WallConfig(WALL_WIDTH, BOARD_HEIGHT, BOARD_CENTER.x - GATES_SIZE * 0.55, BOARD_HEIGHT, WALL_RADIUS),//bottom-left
  new WallConfig(BOARD_CENTER.x + GATES_SIZE * 0.5, BOARD_HEIGHT, BOARD_WIDTH - WALL_WIDTH, BOARD_HEIGHT, WALL_RADIUS),//bottom-right
];

const PLAYER_A_WALLS = [];
const PLAYER_B_WALLS = [];

for (let i = 0; i < WALLS_CONFIG.length; i++) {
  const wallConf = WALLS_CONFIG[i];

  if (!wallConf.visible)
    continue;

  const wallY = (wallConf.ay + wallConf.by) * 0.5;

  if (wallY < 5) {
    PLAYER_A_WALLS.push(wallConf);
  } else if (wallY > BOARD_HEIGHT - 5) {
    PLAYER_B_WALLS.push(wallConf);
  }
}

const CIRCLES_CONFIG = {
  ball: new CircleConfig(BOARD_CENTER.x, BOARD_CENTER.y, BALL_RADIUS),
  playerA: new CircleConfig(PLAYER_A_BOX.center().x, PLAYER_A_BOX.center().y, PLAYER_RADIUS),
  playerB: new CircleConfig(PLAYER_B_BOX.center().x, PLAYER_B_BOX.center().y, PLAYER_RADIUS),
}

export {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  BOARD_CENTER,
  GATES_SIZE,
  PLAYER_A_BOX,
  PLAYER_B_BOX,
  PLAYER_RADIUS,
  BALL_RADIUS,
  WALL_RADIUS,
  WALL_WIDTH,
  BALL_MAX_SPEED,
  PLAYER_MAX_SPEED,
  WALLS_CONFIG,
  CIRCLES_CONFIG,
  PLAYER_A_WALLS,
  PLAYER_B_WALLS
};