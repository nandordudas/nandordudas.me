import type { Ball } from './ball'
import type { LEVELS } from './constants'
import type { Net } from './net'
import type { Paddle } from './paddle'
import type { Wall } from './wall'

export interface DrawableProps {
  draw: (context: OffscreenCanvasRenderingContext2D) => void
}

export interface Coordinate {
  x: number
  y: number
}

export type Drawable = Ball | Paddle | Wall
export type Paddles = [Paddle, Paddle]
export type Walls = [Wall, Wall, Wall, Wall]
export type Board = [Ball, ...Paddles, ...Walls, Net]

export type Level = keyof typeof LEVELS
