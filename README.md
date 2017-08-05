# Snake

> See it at [this website](snake.robertbalicki.com).

## How to run it locally

Clone this repo, `yarn` and `npm start`. `yarn`, `npm` and possibly `flow-bin` need to be installed globally.

## The good parts

* It works!
* Modular!
* Global structure is good. An event loop, clear flow of `update => re-render` and some event listeners. So, similar to react in a sense :)
* Complicated code is (mostly) isolated into a few methods, i.e. `transitionSnakeHead`
* Use of flexbox means that it's really easy to resize.

## The bad parts

* Chose the wrong abstraction:
  * Initially, I decided to store the game board as an NxN array of pieces.
  * Instead, a better abstraction would have been to only store the snake as an array of `{row, col}`.
  * As a result, `transitionSnakeHead` in `gameBoard.js` is bloated and complicated. Lookups (`.snakeTailPosition` etc.) are n^2 operations, etc.
  * There exist flow errors that I didn't fix, due to the bad abstraction!
* Flow enums done lazily are no good.
  * I a union type, `SquareContents` that is the union of `SnakeHead | SnakeBody | Space | Apple | SnakeTail`. Each item in the enum contains extra information, e.g. `.isEmpty` (determines whether the snake head can transition into it), etc.
  * Instead, I should have made a union type `SquareContents = 'SnakeHead' | 'SnakeBody' | 'Space' | etc`, and had a separate object of type `{ [SquareContents]: auxiliary information }`, where auxiliary information includes `isEmpty`, etc.
  * (Note that if I had chosen the wrong abstraction, this union type would not have been necessary.)
* Types are strewn about in a few files. Not ideal, but in a project like this, probably not the end of the world.
* Didn't commit changes as I went, whoops.
* Bug that used to exist: you "can't turn 180 degree", but if you quickly (within a single tick) hit a perpendicular direction, then quickly hit the previous direction, you can turn the snake 180 degrees.
  * The fix (`directionAtLastTransition`) is a bit hacky.

## Todo

* Use the right abstraction.
* More styling.
* Style the snake body based on the direction it is heading, e.g. have ~16 pngs (`left-to-right`, `end-to-right`, `bottom-to-right`, etc.)
* Fix enums.