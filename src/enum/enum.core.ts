export abstract class Enum {
  static values<T extends typeof Enum>(this: T): string[] {
    return Object.values(new (this as any)());
  }
}
