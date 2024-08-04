export interface CoordinateContract {
  x: number
  y: number
}

export interface LineContract {
  start: CoordinateContract
  end: CoordinateContract
  length: number
}

export interface BodyContract {
  position: CoordinateContract
  velocity: CoordinateContract
  acceleration: CoordinateContract
  mass: number
}

export interface PhysicsEngineContract<T extends BodyContract = BodyContract> {
  gravity: number
  friction: number
  bodies: T[]
  addBody: <U extends T>(body: U) => U
  update: FrameRequestCallback
}
