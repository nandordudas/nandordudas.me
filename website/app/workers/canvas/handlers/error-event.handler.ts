import { DebugNamespace } from '~/workers/canvas/shared/constants/enums.constants'
import { useDebugger } from '~/workers/canvas/utils/helpers/use-debugger.helper'

const debug = useDebugger(DebugNamespace.ErrorEventHandler)

export function errorEventHandler(error: ErrorEvent): void {
  debug(error)
}
