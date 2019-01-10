export default function (max) {
  let num, curr, prev
  const limit = max || 1

  function keep(key, value) {
    if (++num > limit) {
      prev = curr
      reset(1)
      ++num
    }
    curr[key] = value
  }

  function reset(isPartial) {
    num = 0
    curr = Object.create(null)
    isPartial || (prev = Object.create(null))
  }

  reset()

  return {
    clear: reset,
    has(key) {
      return curr[key] !== void 0 || prev[key] !== void 0
    },
    get(key) {
      let val = curr[key]
      if (val !== void 0) { return val }
      if ((val = prev[key]) !== void 0) {
        keep(key, val)
        return val
      }
    },
    set(key, value) {
      if (curr[key] !== void 0) {
        curr[key] = value
      } else {
        keep(key, value)
      }
    }
  }
}
