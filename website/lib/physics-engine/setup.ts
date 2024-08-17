import type { OffscreenCanvasScale } from './constants'
import type { Renderer } from './renderer'

import { Ball } from './body.ball'
import { Net } from './body.net'
import { Paddle } from './body.paddle'
import { Wall } from './body.wall'
import { PaddleMovement } from './paddle-movement'
import { ShapeRenderer } from './renderer.shape'
import { Circle } from './shape.circle'
import { Line } from './shape.line'
import { Rectangle } from './shape.rectangle'
import { Vector2D } from './vector-2d'
import { World } from './world'

interface SetupParams {
  offscreenCanvas: OffscreenCanvas
  /**
   * Original = 1
   * Half = 0.5
   * Double = 2
   * Triple = 3
   */
  scale: OffscreenCanvasScale
}

const boardPadding = 10

const paddleWidth = 4
const paddleHeight = 200

export function setup(params: SetupParams): { renderer: Renderer, world: World } {
  const renderer = new ShapeRenderer(params.offscreenCanvas, params.scale)

  const net = new Net({
    shape: new Line({
      start: Vector2D.create(renderer.offscreenCanvas.width / 2, 0),
      end: Vector2D.create(renderer.offscreenCanvas.width / 2, renderer.offscreenCanvas.height),
    }),
  })

  const topWall = new Wall({
    shape: new Line({
      start: Vector2D.create(0, 0),
      end: Vector2D.create(renderer.offscreenCanvas.width, 0),
    }),
  })

  const bottomWall = new Wall({
    shape: new Line({
      start: Vector2D.create(0, renderer.offscreenCanvas.height),
      end: Vector2D.create(renderer.offscreenCanvas.width, renderer.offscreenCanvas.height),
    }),
  })

  const paddleStart = (renderer.offscreenCanvas.height - paddleHeight) / 2

  const leftPaddle = new Paddle({
    position: Vector2D.create(boardPadding, paddleStart),
    shape: new Rectangle({
      width: paddleWidth,
      height: paddleHeight,
    }),
    movement: new PaddleMovement({
      canvasHeight: renderer.offscreenCanvas.height,
    }),
  })

  const rightPaddle = new Paddle({
    position: Vector2D.create(renderer.offscreenCanvas.width - boardPadding - paddleWidth, paddleStart),
    shape: new Rectangle({
      width: paddleWidth,
      height: paddleHeight,
    }),
    movement: new PaddleMovement({
      canvasHeight: renderer.offscreenCanvas.height,
    }),
  })

  const ball = new Ball({
    position: Vector2D.create(100, 100),
    velocity: Vector2D.zero().randomize(Vector2D.create(40, -40), Vector2D.create(100, 100)),
    shape: new Circle(),
  })

  const world = new World()

  world.addBody(net)
  world.addBody(topWall)
  world.addBody(bottomWall)
  world.addBody(leftPaddle)
  world.addBody(rightPaddle)
  world.addBody(ball)

  return { renderer, world }
}
