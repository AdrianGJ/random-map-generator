import consts from "./const.js";
const { SEA, LAND, BEACH, MOUNTAIN, RIVER, FOREST } = consts;

// const SEA = " ";
// const LAND = ".";
// const BEACH = "+";
// const MOUNTAIN = "A";
// const FOREST = "T";
// const RIVER = "*";

const RV_PASS = [LAND, BEACH, FOREST];

class Board {
  constructor({
    size,
    initialLandPoints,
    landGrowProb,
    landGrowDecProb,
    mountainProb,
    mountainExtendProb,
    mountainExtendDecProb,
    forestProb,
    forestExtendProb,
    forestExtendDecProb,
    riverProb,
    riverMaxSteps,
    riverHasToFinishInSea
  }) {
    this.size = size;
    this.initialLandPoints = initialLandPoints;
    this.landGrowProb = landGrowProb;
    this.landGrowDecProb = landGrowDecProb;
    this.mountainProb = mountainProb;
    this.mountainExtendProb = mountainExtendProb;
    this.mountainExtendDecProb = mountainExtendDecProb;
    this.forestProb = forestProb;
    this.forestExtendProb = forestExtendProb;
    this.forestExtendDecProb = forestExtendDecProb;
    this.riverProb = riverProb;
    this.riverMaxSteps = riverMaxSteps;
    this.riverHasToFinishInSea = riverHasToFinishInSea;
    this.board = new Array(size)
      .fill(null)
      .map(() => new Array(size).fill(SEA));
    this.initialPoints = [];
    this.mountainPoints = [];
    this.forestPoints = [];
    this.rvCandidate = [];
    this.populate();
  }

  populate() {
    for (let i = 0; i < this.initialLandPoints; i++) {
      const x = Math.floor(Math.random() * this.size);
      const y = Math.floor(Math.random() * this.size);
      this.initialPoints.push([x, y]);
      this.extendLand(x, y, this.landGrowProb);
    }
    this.mountainPoints.forEach(([x, y]) =>
      this.extendMountains(x, y, this.mountainExtendProb)
    );
    this.forestPoints.forEach(([x, y]) =>
      this.extendForests(x, y, this.forestExtendProb)
    );
    this.rvCandidate.forEach(([x, y]) => this.extendRivers(x, y));
    this.clean();
  }

  extendLand(x, y, growProb) {
    if (this.outOfBoundaries([x, y]) || this.board[x][y] === LAND) return;
    if (Math.random() < this.mountainProb) this.mountainPoints.push([x, y]);
    if (Math.random() < this.forestProb) this.forestPoints.push([x, y]);
    if (Math.random() < growProb) {
      this.board[x][y] = LAND;
      this.extendLand(x + 1, y, growProb - this.landGrowDecProb);
      this.extendLand(x - 1, y, growProb - this.landGrowDecProb);
      this.extendLand(x, y + 1, growProb - this.landGrowDecProb);
      this.extendLand(x, y - 1, growProb - this.landGrowDecProb);
    } else {
      this.board[x][y] = BEACH;
    }
  }

  extendMountains(x, y, growProb) {
    if (
      this.outOfBoundaries([x, y]) ||
      this.board[x][y] === SEA ||
      this.board[x][y] === MOUNTAIN ||
      Math.random() > growProb
    ) {
      return;
    }
    this.board[x][y] = MOUNTAIN;
    if (Math.random() < this.riverProb) this.rvCandidate.push([x, y]);
    this.extendMountains(x + 1, y, growProb - this.mountainExtendDecProb);
    this.extendMountains(x - 1, y, growProb - this.mountainExtendDecProb);
    this.extendMountains(x, y + 1, growProb - this.mountainExtendDecProb);
    this.extendMountains(x, y - 1, growProb - this.mountainExtendDecProb);
  }

  extendForests(x, y, growProb) {
    if (
      this.outOfBoundaries([x, y]) ||
      this.board[x][y] !== LAND ||
      Math.random() > growProb
    ) {
      return;
    }
    this.board[x][y] = FOREST;
    this.extendForests(x + 1, y, growProb - this.forestExtendDecProb);
    this.extendForests(x - 1, y, growProb - this.forestExtendDecProb);
    this.extendForests(x, y + 1, growProb - this.forestExtendDecProb);
    this.extendForests(x, y - 1, growProb - this.forestExtendDecProb);
  }

  extendRivers(x, y) {
    let path = [[x, y]];
    let finished = false;
    let steps = 0;

    const alreadyVisited = (x, y) => {
      return path.some(([_x, _y]) => x === _x && y === _y);
    };

    while (!finished && ++steps < this.riverMaxSteps) {
      let [lastX, lastY] = path[path.length - 1];
      const adyacents = this.adyacents(lastX, lastY);
      if (adyacents.find(([_x, _y]) => this.board[_x][_y] === SEA)) {
        finished = true;
      } else {
        const possibilities = adyacents.filter(
          ([_x, _y]) =>
            !alreadyVisited(_x, _y) && RV_PASS.includes(this.board[_x][_y])
        );
        if (!possibilities.length) {
          finished = true;
          path = [];
        } else {
          path.push(
            possibilities[Math.floor(Math.random() * possibilities.length)]
          );
        }
      }
    }
    if (this.riverHasToFinishInSea && steps === this.riverMaxSteps) path = [];
    path.shift();
    path.forEach(([x, y]) => (this.board[x][y] = RIVER));
  }

  clean() {
    for (let x = 0; x < this.board.length; x++) {
      for (let y = 0; y < this.board.length; y++) {
        const position = this.board[x][y];
        const adyacents = this.adyacents(x, y);
        if (
          position === BEACH &&
          !adyacents.map(([x, y]) => this.board[x][y]).includes(SEA)
        ) {
          this.board[x][y] = LAND;
        } else if (
          position === RIVER &&
          adyacents.filter(
            ([_x, _y]) => this.board[_x] && this.board[_x][_y] === RIVER
          ).length > 3
        ) {
          this.board[x][y] = LAND;
        }
      }
    }
  }

  adyacents(x, y) {
    return [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ].filter(([x, y]) => !this.outOfBoundaries([x, y]));
  }

  outOfBoundaries([x, y]) {
    return x < 0 || x >= this.size || y < 0 || y >= this.size;
  }

  toString() {
    return this.board.map(x => x.join("")).join("\n");
  }
}

export default Board;

// const size = 120;
// const initialLandPoints = 17;
// const landGrowProb = 1;
// const landGrowDecProb = 0.03;
// const mountainProb = 0.001;
// const mountainExtendProb = 1;
// const mountainExtendDecProb = 0.1;
// const forestProb = 0.003;
// const forestExtendProb = 1;
// const forestExtendDecProb = 0.05;
// const riverProb = 0.1;
// const riverMaxSteps = 30;
// const riverHasToFinishInSea = true;

// const prdd = new Prdd({
//   size,
//   initialLandPoints,
//   landGrowProb,
//   landGrowDecProb,
//   mountainProb,
//   mountainExtendProb,
//   mountainExtendDecProb,
//   forestProb,
//   forestExtendProb,
//   forestExtendDecProb,
//   riverProb,
//   riverMaxSteps,
//   riverHasToFinishInSea
// });

// console.log(prdd.toString());
