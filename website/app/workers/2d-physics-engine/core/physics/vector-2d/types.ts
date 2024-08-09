export type ScalarOrVector2D = Scalar | Coordinates2D

export type Operation<T, R extends Vector2DBasicContract> = (input: T) => R

export type ScalarAndVectorOperation = Intersection<[
  Operation<Scalar, Vector2DBasicContract>,
  Operation<Coordinates2D, Vector2DBasicContract>,
]>

export type Vector2DContract = Intersection<[
  Vector2DBasicContract,
  Vector2DUtilityContract,
  Vector2DAlgebraContract,
  Vector2DTrigonometryContract,
  Vector2DTransformationContract,
]>

export type Vector2DCoordinateWithUtilityContract = Intersection<[
  Coordinates2D,
  Vector2DUtilityContract,
]>

export interface Vector2DBasicContract extends Readonly<Coordinates2D> {
  add: ScalarAndVectorOperation
  subtract: ScalarAndVectorOperation
  multiply: ScalarAndVectorOperation
  divide: ScalarAndVectorOperation
  isEquals: (other: Vector2DContract) => boolean
  isZero: () => boolean
  isOnAxis: (axis?: keyof Coordinates2D) => boolean
}

export interface Vector2DAlgebraContract {
  dot: (other: Vector2DContract) => Scalar
  cross: (other: Vector2DContract) => Scalar
  magnitudeSquared: () => Scalar
  magnitude: () => Scalar
  normalize: () => Vector2DBasicContract
}

export interface Vector2DTrigonometryContract {
  angle: () => Scalar
  rotate: (angle: Radians) => Vector2DContract
  distanceTo: (other: Vector2DContract) => Scalar
}

export interface Vector2DTransformationContract {
  reflect: (normal: Vector2DContract) => Vector2DContract
  limit: <T extends Vector2DContract>(min: Scalar, max: Scalar) => T
  lerp: (other: Vector2DContract, t: Scalar) => Vector2DContract
}

export interface Vector2DUtilityContract {
  isInstanceOf: <T extends Vector2DContract>(type: Constructor<T>) => boolean
  toString: () => string
  toArray: () => Point2D
  toObject: () => Coordinates2D
  clone: () => Vector2DBasicContract
}
