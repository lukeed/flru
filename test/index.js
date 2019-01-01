const test = require('tape');
const flru = require('../dist/flru');

const isObject = x => Object.prototype.toString.call(x, '[object Object]');

test('exports', t => {
	let keys = ['has', 'clear', 'get', 'set'];
	t.is(typeof flru, 'function', 'exports a function');

	let foo = new flru();
	t.true(isObject(foo), 'works with `new` keyword');
	keys.forEach(k => {
		t.is(typeof foo[k], 'function', `~> has "${k}" method`);
	});

	let bar = flru();
	t.true(isObject(bar), 'works without `new` keyword');
	keys.forEach(k => {
		t.is(typeof bar[k], 'function', `~> has "${k}" method`);
	});

	t.end();
});

test('has()', t => {
	let key = 'a';
	let foo = flru();

	foo.set(key, 1);
	t.is(foo.has(key), true, '~> returns `true` when known');
	t.is(foo.has('foobar'), false, '~> returns `false` when unknown');

	t.end();
});

test('clear()', t => {
	let foo = flru(3);
	let keys = ['a', 'b', 'c'];

	keys.forEach(foo.set);

	keys.forEach(k => {
		t.true(foo.has(k), `(pre) key "${k}" exists`);
	});

	t.is(foo.clear(), undefined, '~> clear() returns nothing');

	keys.forEach(k => {
		t.false(foo.has(k), `(post) key "${k}" unknown`);
	});

	t.end();
});

test('ordering', t => {
	let foo = flru(3);
	const keys = (arr, bool) => t.is(arr.every(foo.has), bool, `[${arr.toString()}] ~> ${bool ? '' : 'un'}known`);

	['a', 'b', 'c'].forEach(foo.set);
	keys(['a', 'b', 'c'], true);

	t.pass(`>> set('d')`);
	t.is(foo.set('d', 4), undefined, '~> returns nothing');
	keys(['a', 'b', 'c', 'd'], true);

	t.pass(`>> set('e')`);
	foo.set('e', 5);
	keys(['a', 'b', 'c', 'd', 'e'], true); // 2n - 1

	t.pass(`>> set('f')`);
	foo.set('f', 6);
	keys(['d', 'e', 'f'], true);
	keys(['a', 'b', 'c'], false); // purged

	t.pass(`>> set('g')`);
	foo.set('g', 7);
	keys(['d', 'e', 'f', 'g'], true);

	t.pass(`>> get('e')`);
	t.is(foo.get('e'), 5, '~> returns item value');
	keys(['d', 'e', 'f', 'g'], true); // unchanged, altho "e" exists twice

	t.pass(`>> get('d')`);
	foo.get('d');
	keys(['d', 'e', 'g'], true); // purged after "e" and "d" copied over
	keys(['f'], false);

	t.end();
});
