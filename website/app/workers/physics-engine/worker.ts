// import { errorHandler, messageEventHandler } from './handlers'
import * as physicsEngine from './physics-engine'

addEventListener('error', physicsEngine.errorHandler)
addEventListener('message', physicsEngine.messageEventHandler)
