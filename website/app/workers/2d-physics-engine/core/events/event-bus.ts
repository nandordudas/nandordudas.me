export class EventBus {
  on(_key: string, _callback: () => void): void { }
  emit(_key: string): void { }
  off(): void { }
  once(): void { }
}
