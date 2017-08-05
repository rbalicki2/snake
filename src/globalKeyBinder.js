// @flow

export type KeyCode = number;

export const KEYS: { [string]: KeyCode } = {
  LEFT: 37,
  DOWN: 40,
  RIGHT: 39,
  UP: 38,
};

export type KeyDirection = $Keys<typeof KEYS>;

export default (keyCode: KeyCode, handler: () => void) => {
  window.addEventListener('keydown', (e) => {
    if (e.keyCode === keyCode) {
      handler();
    }
  });
};
