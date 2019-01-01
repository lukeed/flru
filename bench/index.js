const mri = require('mri');
const { Suite } = require('benchmark');
const forEach = require('@arr/foreach');

const argv = process.argv.slice(2);
const { _, limit } = mri(argv, {
	default: { limit:1e3 }
});

const libs = {
	'lru-cache': Mod => new Mod(limit),
	'tmp-cache': Mod => new Mod(limit),
	'tiny-lru': Mod => Mod(limit),
	'flru': Mod => Mod(limit),
};

const name = _.shift() || 'flru';
const setup = libs[name];

if (setup === void 0) {
	console.error(`Unknown library: ${name}`);
	process.exit(1);
}

const double = limit * 2;
console.log(`~> Generating ${double} unique keys...`);
const random = () => Math.random().toString(36).substring(4);
const CACHE = setup( require(name === 'flru' ? '../dist/flru' : name) );
const FULL = Array.from({ length:double }, random);
const HALF = FULL.slice(limit);

console.log('\n# %s', name);

new Suite()
	.add('set', () => {
		forEach(HALF, (k, i) => CACHE.set(k, i));
	})
	.add('has', () => {
		forEach(HALF, k => CACHE.has(k));
	})
	.add('get', () => {
		forEach(HALF, k => CACHE.get(k));
	})
	.add('update', () => {
		forEach(HALF, k => CACHE.set(k, k));
	})
	.add('evict', () => {
		forEach(FULL, (k, i) => CACHE.set(k, i));
	})
	.on('cycle', e => console.log(String(e.target)))
	.run();
