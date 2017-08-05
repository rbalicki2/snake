// @flow
export default (eventLoopHandler: () => void, milliseconds: number): () => void => {
  // setInterval is not ideal, as it batches events when the browser
  // tab is not foregrounded.
  const eventLoopId = setInterval(eventLoopHandler, milliseconds);
  const stop = () => clearInterval(eventLoopId);
  return stop;
};
