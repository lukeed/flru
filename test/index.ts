import { test } from 'node:test';
import assert from 'node:assert';
import flru from '../dist/index.js';

const isObject = (x: unknown): boolean => Object.prototype.toString.call(x) === '[object Object]';

test('exports', () => {
	const keys = ['has', 'clear', 'get', 'set'];
	assert.strictEqual(typeof flru, 'function', 'exports a function');

	const bar = flru();
	assert.ok(isObject(bar), 'works without `new` keyword');
	keys.forEach(k => {
		assert.strictEqual(typeof bar[k], 'function', `~> has "${k}" method`);
	});
});

test('has()', () => {
	const key = 'a';
	const foo = flru();

	foo.set(key, 1);
	assert.strictEqual(foo.has(key), true, '~> returns `true` when known');
	assert.strictEqual(foo.has('foobar'), false, '~> returns `false` when unknown');
});

test('clear()', () => {
	const foo = flru(3);
	const keys = ['a', 'b', 'c'];

	keys.forEach(k => foo.set(k, k));

	keys.forEach(k => {
		assert.ok(foo.has(k), `(pre) key "${k}" exists`);
	});

	assert.strictEqual(foo.clear(), undefined, '~> clear() returns nothing');

	keys.forEach(k => {
		assert.ok(!foo.has(k), `(post) key "${k}" unknown`);
	});
});

test('ordering', () => {
	const foo = flru(3);
	const checkKeys = (arr, bool) => assert.strictEqual(arr.every(k => foo.has(k)), bool, `[${arr.toString()}] ~> ${bool ? '' : 'un'}known`);

	// A=[a,b,c]  &  S=[]
	['a', 'b', 'c'].forEach(k => foo.set(k, k));
	checkKeys(['a', 'b', 'c'], true);

	// >> set('d')  A=[d]  &  S=[a,b,c]
	assert.strictEqual(foo.set('d', 4), undefined, '~> returns nothing');
	checkKeys(['a', 'b', 'c', 'd'], true);

	foo.set('e', 5);
	// >> set('e')  A=[d,e]  &  S=[a,b,c]
	checkKeys(['a', 'b', 'c', 'd', 'e'], true); // 2n - 1

	foo.set('f', 6);
	// >> set('f')  A=[d,e,f]  &  S=[a,b,c]
	checkKeys(['d', 'e', 'f'], true);
	checkKeys(['a', 'b', 'c'], true); //=> stale

	foo.set('g', 7);
	// >> set('g')  A=[g]  &  S=[d,e,f]
	checkKeys(['d', 'e', 'f', 'g'], true);
	checkKeys(['a', 'b', 'c'], false); // purged

	// >> get('e')  A=[g,e]  &  S=[d,e,f]
	assert.strictEqual(foo.get('e'), 5, '~> returns item value');
	checkKeys(['d', 'e', 'f', 'g'], true); // unchanged, altho "e" exists twice

	foo.get('d');
	// >> get('d')  A=[g,e,d]  &  S=[d,e,f]
	checkKeys(['g', 'e', 'd', 'f'], true);

	foo.set('a', 1);
	// >> set('a')  A=[a]  &  S=[g,e,d]
	checkKeys(['a', 'g', 'e', 'd'], true);
	checkKeys(['f'], false); // purged
});
