import { isReadable } from './utils'

export function httpsServerFiles() {
  const HTTPS_SERVER_FILES = {
    cert: import.meta.env.DEV_SERVER_CERT,
    key: import.meta.env.DEV_SERVER_KEY,
  } as const

  if (!Object.values(HTTPS_SERVER_FILES).every(isReadable))
    return false

  return HTTPS_SERVER_FILES
}
