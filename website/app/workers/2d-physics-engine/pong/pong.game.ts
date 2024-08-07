import type { Paddle } from './bodies/paddle'
import type { Direction } from '../constants'

import { Game } from '../core/game/game'

export class PongGame<T extends Record<string, any>, Events extends Record<string, unknown>> extends Game<T, Events> {
  movePaddle(paddle: Paddle, direction: Direction): void {
    debug('movePaddle', paddle, direction)
  }
}
