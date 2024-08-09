import type { ScalarOrVector2D, Vector2DBasicContract } from './types'

import { isScalar } from '2dpe/helpers'

import { Vector2DBasic } from './vector-2d-basic'

export function extractVector2DBasic(scalarOrVector2D: ScalarOrVector2D): Vector2DBasicContract {
  if (isScalar(scalarOrVector2D))
    return new Vector2DBasic(scalarOrVector2D, scalarOrVector2D)

  return new Vector2DBasic(scalarOrVector2D.x, scalarOrVector2D.y)
}
