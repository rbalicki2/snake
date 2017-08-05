// @flow

import GameBoard from 'src/gameBoard';
import { type KeyDirection } from 'src/globalKeyBinder';

export default class GameState {
  direction: ?KeyDirection;
  board: GameBoard;
  gameOver: boolean = false;

  constructor(board: GameBoard) {
    this.board = board;
  }

  get isMoving() {
    return !!this.direction;
  }

  transition(): void {
    if (this.isMoving && !this.gameOver) {
      // $FlowFixMe - this.isMoving implies this.direction is not null
      this.board.transitionSnakeHead(this.direction);
    }
  }
}
