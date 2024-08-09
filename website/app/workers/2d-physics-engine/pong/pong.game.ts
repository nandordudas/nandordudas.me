import type { Paddle } from './bodies/paddle'
import type { Direction } from '2dpe/constants'

import { Game } from '2dpe/core/game/game'

export class PongGame<
  T extends GenericObject<any>,
  Events extends GenericObject,
> extends Game<T, Events> {
  movePaddle({ paddle, direction }: { paddle: Paddle, direction: Direction }): void {
    paddle.direction = direction
    paddle.speed = 100
    // TODO: make this configurable, it doesn't seems to work
    paddle.canvasHeight = this.renderer.offscreenCanvas.height
  }
}
