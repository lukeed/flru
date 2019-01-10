const test = require('tape')
const flru = require('../dist/flru')

const isObject = x => Object.prototype.toString.call(x, '[object Object]')

test('exports', (t) => {
  const keys = ['has', 'clear', 'get', 'set']
  t.is(typeof flru, 'function', 'exports a function')

  const foo = new flru()
  t.true(isObject(foo), 'works with `new` keyword')
  keys.forEach((k) => {
    t.is(typeof foo[k], 'function', `~> has "${k}" method`)
  })

  const bar = flru()
  t.true(isObject(bar), 'works without `new` keyword')
  keys.forEach((k) => {
    t.is(typeof bar[k], 'function', `~> has "${k}" method`)
  })

  t.end()
})

test('has()', (t) => {
  const key = 'a'
  const foo = flru()

  foo.set(key, 1)
  t.is(foo.has(key), true, '~> returns `true` when known')
  t.is(foo.has('foobar'), false, '~> returns `false` when unknown')

  t.end()
})

test('clear()', (t) => {
  const foo = flru(3)
  const keys = ['a', 'b', 'c']

  keys.forEach(foo.set)

  keys.forEach((k) => {
    t.true(foo.has(k), `(pre) key "${k}" exists`)
  })

  t.is(foo.clear(), undefined, '~> clear() returns nothing')

  keys.forEach((k) => {
    t.false(foo.has(k), `(post) key "${k}" unknown`)
  })

  t.end()
})

test('ordering', (t) => {
  const foo = flru(3)
  const keys = (arr, bool) => t.is(arr.every(foo.has), bool, `[${arr.toString()}] ~> ${bool ? '' : 'un'}known`);

  // A=[a,b,c]  &  S=[]
  ['a', 'b', 'c'].forEach(foo.set)
  keys(['a', 'b', 'c'], true)

  t.pass(`>> set('d')`) // A=[d]  &  S=[a,b,c]
  t.is(foo.set('d', 4), undefined, '~> returns nothing')
  keys(['a', 'b', 'c', 'd'], true)

  foo.set('e', 5)
  t.pass(`>> set('e')`)
  // A=[d,e]  &  S=[a,b,c]
  keys(['a', 'b', 'c', 'd', 'e'], true) // 2n - 1

  foo.set('f', 6)
  t.pass(`>> set('f')`)
  // A=[d,e,f]  &  S=[a,b,c]
  keys(['d', 'e', 'f'], true)
  keys(['a', 'b', 'c'], true) //= > stale

  foo.set('g', 7)
  t.pass(`>> set('g')`)
  // A=[g]  &  S=[d,e,f]
  keys(['d', 'e', 'f', 'g'], true)
  keys(['a', 'b', 'c'], false) // purged

  t.pass(`>> get('e')`)
  // A=[g,e]  &  S=[d,e,f]
  t.is(foo.get('e'), 5, '~> returns item value')
  keys(['d', 'e', 'f', 'g'], true) // unchanged, altho "e" exists twice

  foo.get('d')
  t.pass(`>> get('d')`)
  // A=[g,e,d]  &  S=[d,e,f]
  keys(['g', 'e', 'd', 'f'], true)

  foo.set('a', 1)
  t.pass(`>> set('a'`)
  // A=[a]  &  S=[g,e,d]
  keys(['a', 'g', 'e', 'd'], true)
  keys(['f'], false) // purged

  t.end()
})
