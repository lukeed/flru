import flru from './src/index.js';

// Create a cache with max 3 items
const cache = flru(3);

// Set some values
cache.set('foo', 'bar');
cache.set('hello', 'world');
cache.set('key', 'value');

// Get a value
console.log(cache.get('foo')); // 'bar'

// Check if key exists
console.log(cache.has('hello')); // true

// Add more items (will rotate old ones)
cache.set('new', 'item');

// Clear the cache
cache.clear();
