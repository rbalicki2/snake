// @flow

import { type SquareContents } from 'src/gameBoard';
import type GameState from 'src/gameState';

const innerHtmlStringForRow = (row: $ReadOnlyArray<SquareContents>): string =>
  row.map(col => `<div class="col"><span>${col.renderAs}</span></div>`).join('');

export default (node: Element, state: GameState) => {
  const innerBoardString: string = state.board.pieces.map(row =>
    `<div class="row">${innerHtmlStringForRow(row)}</div>`
  ).join(' ');
  const boardString = `<div class="grid">${innerBoardString}</div>`;

  const gameOverString = state.gameOver ? '<div>Game Over!</div>' : '<div></div>';

  /* eslint-disable no-param-reassign */
  node.innerHTML = `<div>${boardString}${gameOverString}</div>`;
};
