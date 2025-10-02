export interface flruCache<T = any> {
  clear(isPartial: boolean): void;
  has(key: string): boolean;
  get(key: string): undefined | T;
  set(key: string, value: T): void;
}

export function flru<T = any>(max: number): flruCache<T>;
