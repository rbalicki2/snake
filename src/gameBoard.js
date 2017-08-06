// @flow

import { type KeyDirection } from 'src/globalKeyBinder';

export type Apple = {
  type: 'Apple',
  renderAs: '🍎',
  isEmpty: true,
  isSnake: false,
};
export type Space = {
  type: 'Space',
  renderAs: ' ',
  isEmpty: true,
  isSnake: false,
};
type SnakeBody = {
  type: 'SnakeBody',
  renderAs: 'X',
  directionToNextPiece: KeyDirection,
  isEmpty: false,
  isSnake: true,
};
type SnakeHead = {
  type: 'SnakeHead',
  renderAs: '🐍',
  isEmpty: false,
  isSnake: true,
};
type SnakeTail = {
  type: 'SnakeTail',
  renderAs: 'X',
  isEmpty: true,
  isSnake: true,
  directionToNextPiece: KeyDirection,
};

export type Snake = SnakeBody | SnakeHead | SnakeTail;
export type SquareContents = Snake | Apple | Space;

const newSpace = (): Space => ({
  type: 'Space',
  renderAs: ' ',
  isEmpty: true,
  isSnake: false,
});
const newSnakeHead = (): SnakeHead => ({
  type: 'SnakeHead',
  renderAs: '🐍',
  isEmpty: false,
  isSnake: true,
});
const newApple = (): Apple => ({
  type: 'Apple',
  renderAs: '🍎',
  isEmpty: true,
  isSnake: false,
});
const newTail = (direction: KeyDirection): SnakeTail => ({
  type: 'SnakeTail',
  renderAs: 'X',
  isEmpty: true,
  isSnake: true,
  directionToNextPiece: direction,
});

const directionsToRowColOffset = {
  LEFT: {
    row: 0,
    col: -1,
  },
  UP: {
    row: -1,
    col: 0,
  },
  DOWN: {
    row: 1,
    col: 0,
  },
  RIGHT: {
    row: 0,
    col: 1,
  },
};

export default class GameBoard {
  pieces: Array<Array<SquareContents>>;

  constructor(
    rows: number,
    cols: number,
    initializeSnakeHead: boolean = true
  ) {
    if (rows < 1 || cols < 1) {
      throw new Error('Board is too small');
    }

    this.pieces = new Array(rows)
      .fill()
      .map(() => new Array(cols).fill(newSpace()));

    if (initializeSnakeHead) {
      const randomRow = Math.floor(Math.random() * rows);
      const randomCol = Math.floor(Math.random() * cols);

      this.pieces[randomRow][randomCol] = newSnakeHead();
    }
  }

  setRandomApple() {
    const numberOfEmptySpots: number
      = this.pieces.reduce((count, row) => row.filter(piece => piece.isEmpty).length + count, 0);
    const randomEmptySpot: number = Math.floor(Math.random() * numberOfEmptySpots);

    // this is a weird use of reduce. It's more like a reduce combined with a foreach,
    this.pieces.reduce((remaining, row, ri) => {
      const numberOfEmptySpotsInRow: number = row.filter(piece => piece.isEmpty).length;
      if (numberOfEmptySpotsInRow <= remaining) {
        return remaining - numberOfEmptySpotsInRow;
      }
      let remainingSpots = remaining;
      row.forEach((piece, ci) => {
        if (piece.isEmpty) {
          if (remainingSpots === 0) {
            this.pieces[ri][ci] = newApple();
          }
          // eslint-disable-next-line
          remainingSpots--;
        }
      });
      return Infinity;
    }, randomEmptySpot);
  }

  get rows(): number {
    return this.pieces.length;
  }

  get cols(): number {
    return this.pieces[0].length;
  }

  get snakeHeadPosition(): { row: number, col: number } {
    return this.getPositionOfType('SnakeHead');
  }

  get snakeTailPosition(): { row: number, col: number } {
    const { row: tailRow, col: tailCol } = this.getPositionOfType('SnakeTail');
    const { row: headRow, col: headCol } = this.getPositionOfType('SnakeHead');

    return {
      row: tailRow === undefined ? headRow : tailRow,
      col: tailCol === undefined ? headCol : tailCol,
    };
  }

  getPositionOfType(type: string) {
    // we're assuming for simplicity that a snake head is present,
    // In the future, handle that case.
    //
    // This function is hilariously janky. TODO do this more elegantly.
    const rowIndex: number = this.pieces.findIndex(row =>
      row.find(col => col.type === type)
    );

    if (rowIndex === -1) {
      // Oh javascript...
      return {};
    }
    const colIndex: number = this.pieces[rowIndex].findIndex(col => col.type === type);

    return {
      row: rowIndex,
      col: colIndex,
    };
  }

  transitionSnakeHead(direction: KeyDirection) {
    this.assertSnakeHeadCanMove(direction);

    // there must be a better way! TODO figure that out
    const newBoard = new GameBoard(this.rows, this.cols, false);

    this.pieces.forEach((row, ri) => row.forEach((piece, ci) => {
      // this is a horrible abstraction.
      if (piece.directionToNextPiece) {
        const { row: rowOffset, col: colOffset }
          // $FloxFixMe - flow should understand this...
          = directionsToRowColOffset[piece.directionToNextPiece];
        const newRow = rowOffset + ri;
        const newCol = colOffset + ci;

        const newDirection = this.pieces[newRow][newCol].directionToNextPiece || direction;
        // $FlowFixMe - flow is wrong in this case...
        newBoard.pieces[newRow][newCol] = {
          directionToNextPiece: newDirection,
          type: piece.type,
          renderAs: piece.renderAs,
          isEmpty: piece.isEmpty,
          isSnake: piece.isSnake,
        };
      } else if (piece.type === 'SnakeHead') {
        const { row: rowOffset, col: colOffset } = directionsToRowColOffset[direction];
        const newRow = rowOffset + ri;
        const newCol = colOffset + ci;

        newBoard.pieces[newRow][newCol] = newSnakeHead(direction);
      }
    }));

    const { row: appleRow, col: appleCol } = this.getPositionOfType('Apple');
    if (newBoard.pieces[appleRow][appleCol].type === 'SnakeHead') {
      newBoard.setRandomApple();
      const { row: tailRow, col: tailCol } = this.snakeTailPosition;
      const currentTail = this.pieces[tailRow][tailCol];
      newBoard.pieces[tailRow][tailCol] = newTail(
        currentTail.directionToNextPiece || direction
      );

      if (currentTail.type !== 'SnakeHead') {
        const tailOffset = directionsToRowColOffset[currentTail.directionToNextPiece];
        const tailMovedTo = newBoard.pieces[tailRow + tailOffset.row][tailCol + tailOffset.col];
        tailMovedTo.type = 'SnakeBody';
        tailMovedTo.isEmpty = false;
      }
    } else {
      newBoard.pieces[appleRow][appleCol] = newApple();
    }

    this.pieces = newBoard.pieces;
  }

  assertSnakeHeadCanMove(direction: KeyDirection) {
    const { row, col } = this.snakeHeadPosition;

    // check boundaries
    const offset = directionsToRowColOffset[direction];
    // sanity check
    if (!offset) {
      throw new Error(`Offset not found, direction: ${direction}`);
    }
    const newRow = offset.row + row;
    const newCol = offset.col + col;

    if (newRow >= this.rows
      || newRow < 0
      || newCol >= this.cols
      || newCol < 0
    ) {
      throw new Error('Snake out of bounds!');
    }

    const piece: SquareContents = this.pieces[newRow][newCol];
    if (!piece.isEmpty) {
      throw new Error(`Snake ran into a ${piece.type}`);
    }
  }
}
