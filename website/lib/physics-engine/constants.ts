export const TAU = 2 * Math.PI
export const DEGREES_PER_RADIAN = 180 / Math.PI
export const RADIANS_PER_DEGREE = 1 / DEGREES_PER_RADIAN

export const enum VerticalMovement {
  Up = -1,
  Neutral = 0,
  Down = 1,
}

export const enum BodyMass {
  WeightLess = 0,
  Paddle = 10_000,
  Ball = 10,
  Wall = 100_000,
}

export const enum PaddleSpeed {
  Min = 0,
  Max = 100,
  Slow = 10,
  Normal = 20,
  Fast = 80,
}

export const enum OffscreenCanvasScale {
  Original = 1,
  Half = 0.5,
  Double = 2,
  Triple = 3,
}
