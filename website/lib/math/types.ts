declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Contracts {
    interface Coordinate {
      readonly x: number
      readonly y: number
    }

    interface Line {
      readonly start: Coordinate
      readonly end: Coordinate
      readonly length: number
    }

    interface Body {
      readonly id: string
      readonly mass: number
      position: Coordinate
      velocity: Coordinate
      acceleration: Coordinate
    }

    interface PhysicsEngine {
      readonly gravity: number
      readonly friction: number
      bodies: Body[]
      addBody: <T extends Body>(body: T) => T
      update: FrameRequestCallback
    }
  }
}
