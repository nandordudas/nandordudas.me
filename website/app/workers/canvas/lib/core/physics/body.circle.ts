import type { Physics } from 'canvas'

import { Body } from './body'
import * as bodyConstants from './constants/body.constants'

import * as base from '~/workers/canvas/utils/helpers/base'

interface CircleBodyConstructorOptions extends Omit<Physics.BodyBase, 'shapeType'> {
  radius: number
}

export class CircleBody extends Body {
  constructor(options: CircleBodyConstructorOptions) {
    const area = Math.PI * options.radius * options.radius
    const mass = options.density * area
    const restitution = base.clamp(
      options.restitution,
      bodyConstants.MIN_RESTITUTION,
      bodyConstants.MAX_RESTITUTION,
    )

    super({
      ...options,
      mass,
      width: 0,
      height: 0,
      restitution,
      shapeType: bodyConstants.ShapeType.Circle,
    })
  }
}
