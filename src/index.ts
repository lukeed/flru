export interface FlruCache<T = any> {
  clear(isPartial?: boolean): void;
  has(key: string): boolean;
  get(key: string): T | undefined;
  set(key: string, value: T): void;
}

export default function flru<T = any>(max?: number): FlruCache<T> {
  let num: number;
  let curr: Record<string, T>;
  let prev: Record<string, T>;
  const limit = max || 1;

  function keep(key: string, value: T): void {
    if (++num > limit) {
      prev = curr;
      reset(true);
      ++num;
    }
    curr[key] = value;
  }

  function reset(isPartial?: boolean): void {
    num = 0;
    curr = Object.create(null);
    if (!isPartial) {
      prev = Object.create(null);
    }
  }

  reset();

  return {
    clear: reset,
    has(key: string): boolean {
      return curr[key] !== undefined || prev[key] !== undefined;
    },
    get(key: string): T | undefined {
      let val = curr[key];
      if (val !== undefined) return val;
      val = prev[key];
      if (val !== undefined) {
        keep(key, val);
        return val;
      }
      return undefined;
    },
    set(key: string, value: T): void {
      if (curr[key] !== undefined) {
        curr[key] = value;
      } else {
        keep(key, value);
      }
    }
  };
}
