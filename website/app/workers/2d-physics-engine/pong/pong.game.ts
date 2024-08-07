import type { Paddle } from './bodies/paddle'

import { Game } from '../core/game/game'

export class PongGame<T extends Record<string, unknown>, Events extends Record<string, unknown>> extends Game<T, Events> {
  movePaddle(paddle: Paddle, direction: 'up' | 'down'): void {
    debug('movePaddle', paddle, direction)
  }
}
