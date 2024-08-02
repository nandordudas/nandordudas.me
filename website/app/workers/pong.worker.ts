/// <reference lib="webworker" />

import type { Drawable } from './lib/types'

import { Ball } from './lib/ball'
import { Paddle } from './lib/paddle'
import { Vector } from './lib/vector'
import { Wall } from './lib/wall'

const enum EventName {
  init = 'init',
  start = 'start',
}

type CustomEvent = keyof typeof EventName

interface EventPayloadMap {
  [EventName.init]: { canvas: OffscreenCanvas }
  [EventName.start]: never
}

type MessageEventPayload = {
  [K in keyof EventPayloadMap]: { type: K, value: EventPayloadMap[K] }
}[CustomEvent]

type CustomMessageEvent = MessageEvent<MessageEventPayload>

type EventHandler<K extends CustomEvent> = (event: MessageEvent<Extract<MessageEventPayload, { type: K }>>) => void

// eslint-disable-next-line no-console
const _log = console.log.bind(console)

const FPS = 1_000 / 60
const MAX_DELTA_TIME = FPS

const defaults = {
  lineWidth: {
    thin: 0.5,
  } as const,
  colors: {
    leftPaddle: 'white',
    rightPaddle: 'white',
    ball: 'white',
  },
  ball: {
    speed: {
      slow: 1,
      medium: 2,
      fast: 4,
      random: (min = 1, max = 4) => Math.random() * (max - min) + min,
    },
  },
}

let rafId = 0
let lastTimestamp = 0

interface State {
  context2D: OffscreenCanvasRenderingContext2D | null
  ball: Ball
  walls: [Wall, Wall, Wall, Wall]
  paddles: [Paddle, Paddle]
  drawables: Drawable[]
}

const state: State = {
  context2D: null as OffscreenCanvasRenderingContext2D | null,
  // TODO: check greater velocity value than 4, eg. 10
  ball: new Ball(
    new Vector(32, 12),
    new Vector(defaults.ball.speed.random(), defaults.ball.speed.random()),
    new Vector(0.001, 0.001),
    4,
    defaults.colors.ball,
  ),
  walls: [] as unknown as [Wall, Wall, Wall, Wall],
  paddles: [] as unknown as [Paddle, Paddle],
  drawables: [] as Drawable[],
}

const eventMethodMap: { [K in CustomEvent]: EventHandler<K> } = {
  init: (event) => {
    const canvas = event.data.value.canvas

    state.context2D = canvas.getContext('2d')

    postMessage({ type: 'initialized' })

    state.walls = getBounds(state.context2D!)
    state.paddles = getPaddles(state.context2D!)
    state.drawables = [state.ball, ...state.walls, ...state.paddles]
  },
  start: () => {
    stop()

    rafId = requestAnimationFrame(animate)
  },
}

addEventListener('message', (event: CustomMessageEvent): void => {
  _log(event.data)

  const handler = eventMethodMap[event.data.type]

  assert(isEventHandler(handler), 'Unknown event type')
  handler(event)
})

function animate(timestamp = performance.now()): void {
  const _dt = Math.min(timestamp - lastTimestamp, MAX_DELTA_TIME)

  move()

  if (detectGameOver())
    return stop()

  checkCollisions()
  draw()

  lastTimestamp = timestamp
  rafId = requestAnimationFrame(animate)
}

function detectGameOver(): boolean {
  let shouldStop = false

  shouldStop ||= state.ball.position.x < 0 || state.ball.position.x > state.context2D!.canvas.width
  shouldStop ||= state.ball.position.y < 0 || state.ball.position.y > state.context2D!.canvas.height

  return shouldStop
}

function drawLineBetweenBallAndClosestWall(
  context: OffscreenCanvasRenderingContext2D,
  ball: Ball,
  wall: Wall,
  color: string = '#ffffff40',
): void {
  const closestPoint = closestPointBallToWall(ball, wall)

  context.beginPath()
  context.moveTo(ball.position.x, ball.position.y)
  context.lineTo(closestPoint.x, closestPoint.y)

  context.strokeStyle = color
  context.lineWidth = defaults.lineWidth.thin

  context.stroke()
  context.closePath()
}

function move(): void {
  const context = getContext()

  state.ball.move()
  state.paddles.forEach((paddle) => {
    paddle.followBall(state.ball, context)
    paddle.move()
  })
}

// eslint-disable-next-line complexity
function checkCollisions(): void {
  let wallCollision = false

  for (const wall of state.walls.filter(wall => ['top', 'bottom'].includes(wall.id))) {
    if (isColliding(state.ball, wall)) {
      [penetrationResponse, collisionResponse].forEach(fn => fn(state.ball, wall))

      wallCollision = true
    }
  }

  if (!wallCollision) {
    for (const paddle of state.paddles) {
      if (isColliding(state.ball, paddle)) {
        [penetrationResponse, collisionResponse].forEach(fn => fn(state.ball, paddle))

        if (paddle.id === 'left') {
          // Activate the right paddle when the left paddle hits the ball
          const rightPaddle = state.paddles.find(p => p.id === 'right')

          if (rightPaddle)
            rightPaddle.setActive(true)
        }
        else if (paddle.id === 'right') {
          // Deactivate the right paddle when it hits the ball
          paddle.setActive(false)
        }
      }
    }
  }
}

function penetrationResponse(ball: Ball, wall: Wall): void {
  const penetrationVector = ball.position.subtract(closestPointBallToWall(ball, wall))

  ball.position = ball.position.add(penetrationVector.normalize().multiply(ball.radius - penetrationVector.magnitude()))
}

function collisionResponse(ball: Ball, wall: Wall): void {
  const normal = ball.position.subtract(closestPointBallToWall(ball, wall)).normalize()
  const separationVector = Vector.dotProduct(ball.velocity, normal)
  const separationVector2 = -1 * separationVector * ball.elasticity
  const separationVectorDiff = separationVector - separationVector2

  ball.velocity = ball.velocity.add(normal.multiply(-1 * separationVectorDiff))
}

function isColliding(ball: Ball, wall: Wall): boolean {
  const ballToClosest = closestPointBallToWall(ball, wall).subtract(ball.position)

  return ballToClosest.magnitude() < ball.radius
}

function closestPointBallToWall(ball: Ball, wall: Wall): Vector {
  const wallunit = wall.unit()
  const ballToWallStart = wall.start.subtract(ball.position)

  if (Vector.dotProduct(wallunit, ballToWallStart) > 0)
    return wall.start

  const wallEndToBall = ball.position.subtract(wall.end)

  if (Vector.dotProduct(wallunit, wallEndToBall) > 0)
    return wall.end

  const closestDistance = Vector.dotProduct(wallunit, ballToWallStart)
  const closestVector = wallunit.multiply(closestDistance)

  return wall.start.subtract(closestVector)
}

function getBounds(context: OffscreenCanvasRenderingContext2D, color = 'transparent'): [Wall, Wall, Wall, Wall] {
  const vectors = {
    topLeft: new Vector(0, 0),
    topRight: new Vector(context.canvas.width, 0),
    bottomLeft: new Vector(0, context.canvas.height),
    bottomRight: new Vector(context.canvas.width, context.canvas.height),
  }

  return [
    new Wall(vectors.topLeft, vectors.topRight, color, 'top'),
    new Wall(vectors.topRight, vectors.bottomRight, color, 'right'),
    new Wall(vectors.bottomRight, vectors.bottomLeft, color, 'bottom'),
    new Wall(vectors.bottomLeft, vectors.topLeft, color, 'left'),
  ]
}

function getPaddles(context: OffscreenCanvasRenderingContext2D): [Paddle, Paddle] {
  const height = context.canvas.height / 2
  const padding = 10
  const vectors = {
    left: {
      start: new Vector(padding, (context.canvas.height - height) / 2),
      end: new Vector(padding, (context.canvas.height + height) / 2),
    },
    right: {
      start: new Vector(context.canvas.width - padding, (context.canvas.height - height) / 2),
      end: new Vector(context.canvas.width - padding, (context.canvas.height + height) / 2),
    },
  }

  const leftPaddle = new Paddle(vectors.left.start, vectors.left.end, defaults.colors.leftPaddle, 'left')
  const rightPaddle = new Paddle(vectors.right.start, vectors.right.end, defaults.colors.rightPaddle, 'right')

  rightPaddle.setActive(true)

  return [leftPaddle, rightPaddle]
}

function stop(): void {
  cancelAnimationFrame(rafId)

  lastTimestamp = 0
  rafId = 0
}

function draw(): void {
  const context = getContext()

  clearCanvas(context)
  drawLinesBetweenBallAndClosestWall(context)
  drawCollisionPredictionLine(context)

  for (const drawable of state.drawables)
    drawable.draw(context)
}

function drawCollisionPredictionLine(context: OffscreenCanvasRenderingContext2D): void {
  for (const wall of state.walls)
    drawLineBetweenBallAndCollidePoint(context, state.ball, wall)
}

// eslint-disable-next-line complexity
function drawLinesBetweenBallAndClosestWall(context: OffscreenCanvasRenderingContext2D): void {
  const [top, right, bottom, left] = state.walls as [Wall, Wall, Wall, Wall]

  if (state.ball.velocity.x > 0 && state.ball.velocity.y > 0)
    [bottom, right].forEach(wall => drawLineBetweenBallAndClosestWall(context, state.ball, wall))

  if (state.ball.velocity.x < 0 && state.ball.velocity.y > 0)
    [bottom, left].forEach(wall => drawLineBetweenBallAndClosestWall(context, state.ball, wall))

  if (state.ball.velocity.x > 0 && state.ball.velocity.y < 0)
    [top, right].forEach(wall => drawLineBetweenBallAndClosestWall(context, state.ball, wall))

  if (state.ball.velocity.x < 0 && state.ball.velocity.y < 0)
    [top, left].forEach(wall => drawLineBetweenBallAndClosestWall(context, state.ball, wall))

  for (const wall of state.walls)
    drawLineBetweenBallAndClosestWall(context, state.ball, wall, '#ffffff10')
}

function calculateIntersection(ball: Ball, wall: Wall): Vector | undefined {
  const ballDirection = ball.velocity.normalize()
  const wallVector = wall.end.subtract(wall.start)
  const wallNormal = wallVector.normal().normalize()
  const denominator = Vector.dotProduct(ballDirection, wallNormal)

  if (Math.abs(denominator) < 0.000001)
    return

  const ballToWallStart = wall.start.subtract(ball.position)
  const t = Vector.dotProduct(ballToWallStart, wallNormal) / denominator

  if (t < 0)
    return

  const intersectionPoint = ball.position.add(ballDirection.multiply(t))
  const wallLength = wallVector.magnitude()
  const distanceFromStart = intersectionPoint.subtract(wall.start).magnitude()
  const distanceFromEnd = intersectionPoint.subtract(wall.end).magnitude()

  if (distanceFromStart + distanceFromEnd > wallLength + 0.000001)
    return

  return intersectionPoint
}

function drawLineBetweenBallAndCollidePoint(context: OffscreenCanvasRenderingContext2D, ball: Ball, wall: Wall): void {
  const intersectionPoint = calculateIntersection(ball, wall)

  if (!intersectionPoint)
    return

  context.beginPath()
  context.moveTo(ball.position.x, ball.position.y)
  context.lineTo(intersectionPoint.x, intersectionPoint.y)

  context.strokeStyle = '#ffff0010'
  context.lineWidth = defaults.lineWidth.thin

  context.stroke()
  context.closePath()
}

function clearCanvas(context: OffscreenCanvasRenderingContext2D): void {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
}

function getContext(): OffscreenCanvasRenderingContext2D {
  assert(state.context2D !== null, 'Invalid offscreen canvas')

  return state.context2D
}

function isEventHandler<K extends CustomEvent>(value: unknown): value is EventHandler<K> {
  return typeof value === 'function'
}
