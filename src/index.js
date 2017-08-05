// @flow
// This is the entry point into the bundle
// We want the main event loop to be present in here, and all
// other logic elsewhere.

import eventLoop from 'src/eventLoop';
import globalKeyBinder, { KEYS } from 'src/globalKeyBinder';
import GameState from 'src/gameState';
import GameBoard from 'src/gameBoard'; // https://www.youtube.com/watch?v=0h9jN12QbdE
import renderBoard from 'src/renderBoard';

// $FlowFixMe
import 'src/styles.scss';

// this logic is a little bit thin, but since the application state is so simple
// we can probably deal with this for now
const state = new GameState(new GameBoard(16, 16));
state.board.setRandomApple();

globalKeyBinder(KEYS.LEFT, () => {
  if (state.direction !== 'RIGHT') {
    state.direction = 'LEFT';
  }
});
globalKeyBinder(KEYS.RIGHT, () => {
  if (state.direction !== 'LEFT') {
    state.direction = 'RIGHT';
  }
});
globalKeyBinder(KEYS.DOWN, () => {
  if (state.direction !== 'UP') {
    state.direction = 'DOWN';
  }
});
globalKeyBinder(KEYS.UP, () => {
  if (state.direction !== 'DOWN') {
    state.direction = 'UP';
  }
});

// $FlowFixMe - we know that querySelector(#app) returns an element...
renderBoard(document.querySelector('#app'), state);

const stop = eventLoop(() => {
  if (state.isMoving && !state.gameOver) {
    try {
      state.transition();
    } catch (e) {
      // eslint-disable-next-line
      console.log(e);
      state.gameOver = true;
      stop();
    }
    // $FlowFixMe - we know that querySelector(#app) returns an element...
    renderBoard(document.querySelector('#app'), state);
  }
}, 150);

