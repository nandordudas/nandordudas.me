import type { Body } from './body'

import { DebugNamespace } from '~/workers/canvas/shared/constants/enums.constants'

const _debug = useDebugger(DebugNamespace.World)

export class World {
  static readonly gravity: number = 9.81

  #bodies: Body[] = []

  get bodies(): Body[] {
    return this.#bodies
  }

  addBody(body: Body): void {
    this.#bodies.push(body)
  }

  removeBody(body: Body): void {
    // this.#bodies = this.#bodies.filter(b => b !== body)

    const index = this.#bodies.indexOf(body)

    if (index > -1)
      this.#bodies.splice(index, 1)
  }

  step(deltaTime: number) {
    for (const body of this.#bodies)
      body.step(deltaTime)
  }
}
