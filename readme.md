# flru [![Build Status](https://travis-ci.org/lukeed/flru.svg?branch=master)](https://travis-ci.org/lukeed/flru)

> A tiny (217B) and fast Least Recently Used (LRU) cache

Internally, two caches are kept. This is because it's far more performant to swap (and maintain) dictionaries than it is to `delete`/purge keys on every read/write interaction. Because of this, `flru` will store `2n - 1` items in memory, where `n` is the [`max`](#max) limit. In practice, this means that with `max=3` and items `(a, b, c)` already written, writing a `d` value ***will not*** automatically purge the `a` key. Instead, `a` can be retrieved, moving it to the "active" cache. It's only when this "active" half reaches the `max` that the "stale" half is purged.

> See [Usage](#Usage) for a visual explanation~!

This implementation is optimized for all-around performance – reads, writes, updates, and evictions.<br>
If you need a version that's optimized for reads (but slower writes, updates, and evictions), I'd recommend [`tiny-lru`](https://github.com/avoidwork/tiny-lru).


This module is available in three formats:

* **ES Module**: `dist/flru.mjs`
* **CommonJS**: `dist/flru.js`
* **UMD**: `dist/flru.min.js`


## Install

```
$ npm install --save flru
```


## Usage

```js
// Legend:
//    S => the stale cache
//    A => the active cache

const flru = require('flru');

let cache = flru(3); // A=[]      S=[]

cache.set('a', 1);   // A=[a]     S=[]
cache.set('b', 2);   // A=[a,b]   S=[]
cache.set('b', 9);   // A=[a,b]   S=[]
cache.set('c', 3);   // A=[]      S=[a,b,c]

cache.has('a'); //=> true

cache.set('d', 4);   // A=[d]     S=[a,b,c]
cache.get('a');      // A=[d,a]   S=[a,b,c]
cache.set('e', 5);   // A=[]      S=[d,a,e]

cache.has('a'); //=> true
cache.has('b'); //=> false

cache.clear();       // A=[]      S=[]
```


## API

### flru(max)
return `Object`

Initialize a new `flru` cache instance.

#### max
Required: `true`<br>
Type: `Number`<br>
Default: `1`

The maximum number of items to maintain – must be a positive, non-zero integer!

> **Important:** The default value is pointless and will result in excessive computation. It's there only to avoid memory leak!


### flru.has(key)
Return: `Boolean`

Check if the cache has the given key.

#### key
Type: `String`

The key name to check.


### flru.get(key)
Return: `Mixed`

Get the assigned value for a given key. Will return `undefined` if the cache has evicted `key` or never contained it.

#### key
Type: `String`

The item's unique name / identifier.


### flru.set(key, value)
Return: `undefined`

Persist an item to the cache by a given `key` name.

#### key
Type: `String`

The item's unique name / identifier.

#### value
Type: `Mixed`

The item's value to be cached.


### flru.cache(keepOld)
Return: `undefined`

Reset the cache(s) and counter.

#### keepOld
Type: `Boolean`<br>
Default: `false`

When `true`, preserves the stale/outgoing cache.

> **Important:** This is used internally & generally should be ignored!



## Related

- [tmp-cache](https://github.com/lukeed/tmp-cache) - Full-featured (but slower) alternative, supporting time-sensitive expirations.


## License

MIT © [Luke Edwards](https://lukeed.com)
