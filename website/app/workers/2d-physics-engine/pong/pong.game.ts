import type { Paddle } from './bodies/paddle'

import { Game } from '../core/game/game'

export class PongGame<T extends Record<string, any>, Events extends Record<string, unknown>> extends Game<T, Events> {
  movePaddle(paddle: Paddle): void {
    debug('movePaddle', paddle)
  }
}
