import { describe, test, expect } from 'bun:test';
import flru from '../src/index';

const isObject = (x: unknown): boolean => Object.prototype.toString.call(x) === '[object Object]';

describe('exports', () => {
  const keys = ['has', 'clear', 'get', 'set'];

  test('exports a function', () => {
    expect(typeof flru).toBe('function');
  });

  test('works without new keyword', () => {
    const foo = flru();
    expect(isObject(foo)).toBe(true);
    keys.forEach(k => {
      expect(typeof (foo as any)[k]).toBe('function');
    });
  });
});

describe('has()', () => {
  test('returns true when known', () => {
    const foo = flru<number>();
    foo.set('a', 1);
    expect(foo.has('a')).toBe(true);
  });

  test('returns false when unknown', () => {
    const foo = flru<number>();
    foo.set('a', 1);
    expect(foo.has('foobar')).toBe(false);
  });
});

describe('clear()', () => {
  test('clears all keys', () => {
    const foo = flru<string>(3);
    const keys = ['a', 'b', 'c'];

    keys.forEach(k => foo.set(k, k));

    keys.forEach(k => {
      expect(foo.has(k)).toBe(true);
    });

    expect(foo.clear()).toBeUndefined();

    keys.forEach(k => {
      expect(foo.has(k)).toBe(false);
    });
  });
});

describe('ordering', () => {
  test('handles LRU eviction correctly', () => {
    const foo = flru<number>(3);

    // A=[a,b,c] & S=[]
    ['a', 'b', 'c'].forEach((k, i) => foo.set(k, i + 1));
    expect(['a', 'b', 'c'].every(k => foo.has(k))).toBe(true);

    // A=[d] & S=[a,b,c]
    expect(foo.set('d', 4)).toBeUndefined();
    expect(['a', 'b', 'c', 'd'].every(k => foo.has(k))).toBe(true);

    // A=[d,e] & S=[a,b,c]
    foo.set('e', 5);
    expect(['a', 'b', 'c', 'd', 'e'].every(k => foo.has(k))).toBe(true);

    // A=[d,e,f] & S=[a,b,c]
    foo.set('f', 6);
    expect(['d', 'e', 'f'].every(k => foo.has(k))).toBe(true);
    expect(['a', 'b', 'c'].every(k => foo.has(k))).toBe(true); // stale

    // A=[g] & S=[d,e,f]
    foo.set('g', 7);
    expect(['d', 'e', 'f', 'g'].every(k => foo.has(k))).toBe(true);
    expect(['a', 'b', 'c'].every(k => foo.has(k))).toBe(false); // purged

    // A=[g,e] & S=[d,e,f]
    expect(foo.get('e')).toBe(5);
    expect(['d', 'e', 'f', 'g'].every(k => foo.has(k))).toBe(true);

    // A=[g,e,d] & S=[d,e,f]
    foo.get('d');
    expect(['g', 'e', 'd', 'f'].every(k => foo.has(k))).toBe(true);

    // A=[a] & S=[g,e,d]
    foo.set('a', 1);
    expect(['a', 'g', 'e', 'd'].every(k => foo.has(k))).toBe(true);
    expect(foo.has('f')).toBe(false); // purged
  });
});

describe('get()', () => {
  test('returns undefined for unknown keys', () => {
    const foo = flru<number>();
    expect(foo.get('unknown')).toBeUndefined();
  });

  test('returns value for known keys', () => {
    const foo = flru<number>();
    foo.set('key', 42);
    expect(foo.get('key')).toBe(42);
  });
});
