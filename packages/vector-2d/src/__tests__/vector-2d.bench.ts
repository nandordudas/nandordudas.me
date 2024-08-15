import { bench, describe } from 'vitest'

function vector(x: number, y: number) {
  return Object.freeze(Object.create(null, { x: { value: x }, y: { value: y } }))
}

describe.each([
  { time: 0, iterations: 100_000, warmupTime: 100, warmupIterations: 1_000 },
  { time: 0, iterations: 100_000, warmupTime: 0, warmupIterations: 0 },
])('vector2D operations with various inputs $warmupIterations', (benchOptions) => {
  describe.each([
    { name: 'Prototypeless', value: Object.freeze(Object.create(null, { x: { value: 0 }, y: { value: 0 } })) },
    { name: 'Prototypeless (vector)', value: vector(0, 0) },
    { name: 'Small integers', value: { x: 1, y: 2 } },
    { name: 'Large integers', value: { x: 1000000, y: 2000000 } },
    { name: 'Floating point', value: { x: 3.14159, y: 2.71828 } },
    { name: 'Very small floating point', value: { x: 0.00000001, y: 0.00000002 } },
    { name: 'Mixed values', value: { x: 42, y: 0.42 } },
    { name: 'Zero values', value: { x: 0, y: 0 } },
    { name: 'Negative values', value: { x: -5, y: -10 } },
  ])(`input: $name`, ({ value }) => {
    const vector2DArray = new Vector2DArray(0, 0)
    const vector2DObject = new Vector2DObject(0, 0)
    const vector2DInstance = new Vector2DInstance(0, 0)
    const vector2DObjectCachedMap = new Vector2DObjectCachedMap(0, 0)
    const vector2DObjectCachedWeakMap = new Vector2DObjectCachedWeakMap(0, 0)
    const vectorInput = new Vector2DInstance(value.x, value.y)

    const arrayInput: [number, number] = [value.x, value.y]
    const objectInput = { x: value.x, y: value.y }

    bench('vector2DArray', () => {
      vector2DArray.add(arrayInput).add(arrayInput).add(arrayInput).add(arrayInput)
    }, benchOptions)

    bench('vector2DObject', () => {
      vector2DObject.add(objectInput).add(objectInput).add(objectInput).add(objectInput)
    }, benchOptions)

    bench('vector2DInstance', () => {
      vector2DInstance.add(vectorInput).add(vectorInput).add(vectorInput).add(vectorInput)
    }, benchOptions)

    bench('vector2DObjectCachedMap', () => {
      vector2DObjectCachedMap.add(objectInput).add(objectInput).add(objectInput).add(objectInput)
    }, benchOptions)

    bench('vector2DObjectCachedWeakMap', () => {
      vector2DObjectCachedWeakMap.add(objectInput).add(objectInput).add(objectInput).add(objectInput)
    }, benchOptions)
  })

  describe.skip('chaining many small additions', () => {
    const vector2DArray = new Vector2DArray(0, 0)
    const vector2DObject = new Vector2DObject(0, 0)
    const vector2DInstance = new Vector2DInstance(0, 0)
    const vector2DObjectCachedMap = new Vector2DObjectCachedMap(0, 0)
    const vector2DObjectCachedWeakMap = new Vector2DObjectCachedWeakMap(0, 0)
    const vectorInput = new Vector2DInstance(0.1, 0.1)

    const arrayInput: [number, number] = [0.1, 0.1]
    const objectInput = { x: 0.1, y: 0.1 }

    bench('vector2DArray', () => {
      vector2DArray
        .add(arrayInput).add(arrayInput).add(arrayInput).add(arrayInput).add(arrayInput)
        .add(arrayInput).add(arrayInput).add(arrayInput).add(arrayInput).add(arrayInput)
    }, benchOptions)

    bench('vector2DObject', () => {
      vector2DObject
        .add(objectInput).add(objectInput).add(objectInput).add(objectInput).add(objectInput)
        .add(objectInput).add(objectInput).add(objectInput).add(objectInput).add(objectInput)
    }, benchOptions)

    bench('vector2DInstance', () => {
      vector2DInstance
        .add(vectorInput).add(vectorInput).add(vectorInput).add(vectorInput).add(vectorInput)
        .add(vectorInput).add(vectorInput).add(vectorInput).add(vectorInput).add(vectorInput)
    }, benchOptions)

    bench('vector2DObjectCached', () => {
      vector2DObjectCachedMap
        .add(objectInput).add(objectInput).add(objectInput).add(objectInput).add(objectInput)
        .add(objectInput).add(objectInput).add(objectInput).add(objectInput).add(objectInput)
    }, benchOptions)

    bench('vector2DObjectCachedWeakMap', () => {
      vector2DObjectCachedWeakMap
        .add(objectInput).add(objectInput).add(objectInput).add(objectInput).add(objectInput)
        .add(objectInput).add(objectInput).add(objectInput).add(objectInput).add(objectInput)
    }, benchOptions)
  })
})

class Vector2DArray {
  #x: number
  #y: number

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  constructor(x: number, y: number) {
    this.#x = x
    this.#y = y
  }

  add([x, y]: [number, number]): this {
    this.#x += x
    this.#y += y

    return this
  }
}

class Vector2DObject {
  #x: number
  #y: number

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  constructor(x: number, y: number) {
    this.#x = x
    this.#y = y
  }

  add({ x, y }: { x: number, y: number }): this {
    this.#x += x
    this.#y += y

    return this
  }
}

class Vector2DInstance {
  #x: number
  #y: number

  get x() {
    return this.#x
  }

  get y() {
    return this.#y
  }

  constructor(x: number, y: number) {
    this.#x = x
    this.#y = y
  }

  add({ x, y }: Vector2DInstance): this {
    this.#x += x
    this.#y += y

    return this
  }
}

// New Vector2DObjectCachedMap implementation
class Vector2DObjectCachedMap {
  #x: number
  #y: number
  private cache: Map<string, Vector2DObjectCachedMap>

  get x() { return this.#x }
  get y() { return this.#y }

  constructor(x: number, y: number) {
    this.#x = x
    this.#y = y
    this.cache = new Map()
  }

  add(input: { x: number, y: number }): Vector2DObjectCachedMap {
    const key = `${input.x},${input.y}`
    let result = this.cache.get(key)
    if (result)
      return result

    result = new Vector2DObjectCachedMap(this.#x + input.x, this.#y + input.y)
    this.cache.set(key, result)
    return result
  }
}

// New Vector2DObjectCachedWeakMap implementation
class Vector2DObjectCachedWeakMap {
  #x: number
  #y: number
  private weakCache: WeakMap<object, Vector2DObjectCachedWeakMap>

  get x() { return this.#x }
  get y() { return this.#y }

  constructor(x: number, y: number) {
    this.#x = x
    this.#y = y
    this.weakCache = new WeakMap()
  }

  add(input: { x: number, y: number }): Vector2DObjectCachedWeakMap {
    let result = this.weakCache.get(input)
    if (result)
      return result

    result = new Vector2DObjectCachedWeakMap(this.#x + input.x, this.#y + input.y)
    this.weakCache.set(input, result)
    return result
  }
}
