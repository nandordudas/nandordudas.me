import { type PathLike, accessSync, constants } from 'node:fs'

export function isReadable(path: PathLike) {
  try {
    accessSync(path, constants.R_OK)

    return true
  }
  catch {
    return false
  }
}
