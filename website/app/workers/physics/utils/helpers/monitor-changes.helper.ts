import { mainEmitter } from '~/workers/physics/events/emitters/main.emitter'
import { SharedArrayIndex } from '~/workers/physics/shared/enum.constants'
import { delay } from '~/workers/physics/utils/delay'

const POLLING_TIMEOUT_MS = 100

export async function monitorChanges(sharedArray: Int32Array): Promise<void> {
  const previousMouseX = Atomics.load(sharedArray, SharedArrayIndex.MouseX)

  while (true) {
    const result = Atomics.wait(sharedArray, SharedArrayIndex.Key, previousMouseX, POLLING_TIMEOUT_MS)

    if (result !== 'ok')
      continue

    mainEmitter.emit('mousemove', {
      x: Atomics.load(sharedArray, SharedArrayIndex.MouseX),
      y: Atomics.load(sharedArray, SharedArrayIndex.MouseY),
    })

    await delay() // Pause the loop to allow other async events to process
  }
}
