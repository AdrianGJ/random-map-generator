import Board from "./generator.js";
import CONST from "./const.js";

const TILE_SIZE = 15;

const size = 180;

const params = {
  size,
  initialLandPoints: 22,
  landGrowProb: 1.3,
  landGrowDecProb: 0.02,
  mountainProb: 0.001,
  mountainExtendProb: 1,
  mountainExtendDecProb: 0.06,
  forestProb: 0.004,
  forestExtendProb: 1.1,
  forestExtendDecProb: 0.03,
  riverProb: 0.1,
  riverMaxSteps: 30,
  riverHasToFinishInSea: true
};

const board = new Board(params);

const color = {
  [CONST.SEA]: [0, 0, 255],
  [CONST.MOUNTAIN]: [157, 90, 0],
  [CONST.BEACH]: [255, 190, 0],
  [CONST.LAND]: [46, 160, 0],
  [CONST.RIVER]: [0, 150, 255],
  [CONST.FOREST]: [0, 71, 4],
  BLACK: [0, 0, 0],
  WHITE: [255, 255, 255]
};

const colorIntensity = ([r, g, b]) =>
  Math.round(
    (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000
  );

const canvasP5 = new p5(p => {
  p.setup = () => {
    p.createCanvas(size * TILE_SIZE, size * TILE_SIZE);
    p.frameRate(15);
    p.colorMode(p.RGB);
    p.noStroke();
    drawBoard();
  };

  p.draw = () => {};

  const drawBoard = () => {
    p.clear();
    p.textSize(15);
    p.textAlign(p.CENTER);

    for (let column = 0; column < board.board.length; column++) {
      for (let row = 0; row < board.board[column].length; row++) {
        const position = board.board[column][row];
        p.fill(...color[position]);
        p.square(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE);
        const textColor =
          colorIntensity(color[position]) < 127 ? color.WHITE : color.BLACK;
        p.fill(...textColor);
        // p.text(
        //   position,
        //   column * TILE_SIZE,
        //   row * TILE_SIZE,
        //   TILE_SIZE,
        //   TILE_SIZE
        // );
      }
    }
  };
}, "canvas");

console.log(board);
