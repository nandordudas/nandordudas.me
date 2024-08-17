import type { Body } from './body'
import type { Renderer } from './renderer'
import type { Constructor } from './types'

export abstract class Shape {
  abstract draw(renderer: Renderer, body: Body): void

  isInstanceOf<T extends Shape>(type: Constructor<T>): this is T {
    return this instanceof type
  }
}
