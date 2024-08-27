import type { Physics } from 'canvas'

import { Body } from './body'
import * as bodyConstants from './constants/body.constants'

import * as base from '~/workers/canvas/utils/helpers/base'

interface BoxBodyConstructorOptions extends Omit<Physics.BodyBase, 'shapeType'> {
  width: number
  height: number
}

export class BoxBody extends Body {
  constructor(options: BoxBodyConstructorOptions) {
    const area = options.width * options.height
    const mass = options.density * area
    const restitution = base.clamp(
      options.restitution,
      bodyConstants.MIN_RESTITUTION,
      bodyConstants.MAX_RESTITUTION,
    )

    super({
      ...options,
      mass,
      radius: 0,
      restitution,
      shapeType: bodyConstants.ShapeType.Box,
    })
  }
}
