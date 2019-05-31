export interface flruCache {
  clear(isPartial: boolean): void,
  has(key: string): boolean,
  get(key: string): any,
  set(key: string, value: any): void,
}

declare const flru: (max: number) => flruCache;

export default flru;
