import type { Paddle } from './bodies/paddle'

import { Game } from '../core/game/game'

export interface PongGameState { }

export class PongGame extends Game<PongGameState> {
  movePaddle(_paddle: Paddle): void { }
}
