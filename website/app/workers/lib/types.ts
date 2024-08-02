import type { Vector } from './vector'

export interface Drawable {
  draw: (context: OffscreenCanvasRenderingContext2D) => void
}

export interface Moveable {
  position: Vector
  velocity: Vector
  acceleration: Vector
  friction: number

  move: () => void
  reposition: () => void
}
