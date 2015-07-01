exports = exports || {}

M = exports

// Currying
M.curry = function(fn) {
  return M.enableCurriedFunction(fn)
}

M.enableCurriedFunction = function(fn, fixedSize) {
  var cfn = function() {
    return cfn.curriedFunction.apply(this, [].slice.call(arguments))
  }

  cfn.curriedFunction = new M.CurriedFunction(fn, fixedSize)
  return cfn
}

M.CurriedFunction = function(fn, fixedSize) {
  fixedSize = fixedSize || fn.length
  this.length = fixedSize
  this.fn = fn
}

M.CurriedFunction.prototype.apply = function(target, args) {
  var that = this

  if (args.length >= this.length) {
    return this.fn.apply(target, args)
  }

  return M.enableCurriedFunction(function() {
    return that.apply(target, args.concat([].slice.call(arguments)))
  }, this.length - args.length)
}

// Pattern Matching
M._ = function() {}

M.match = function() {
  var patterns = [].slice.call(arguments)
  return M.enableMatch(patterns)
}

M.pattern = function() {
  var args = [].slice.call(arguments),
      fn = args.pop()
  return new M.Pattern(args, fn)
}

M.ofType = function(type, value) {
  if (type === M._) {
    return true
  }

  if (type === Number) {
    return typeof value === "number"
  }

  if (type === String) {
    return typeof value === "string"
  }

  if (type === Boolean) {
    return typeof value === "boolean"
  }

  if (type instanceof Function) {
    return value instanceof type
  }

  return value === type
}

M.enableMatch = function(patterns) {
  var fn = function() {
    var args = [].slice.call(arguments),
        foundPattern = undefined

    patterns.map(function(pattern) {
      if (pattern.matches(args)) {
        foundPattern = foundPattern || pattern
      }
    })

    if (!foundPattern) {
      throw "failed pattern matching, consider using catch-all patterns"
    }

    return foundPattern.apply(this, args)
  }

  return M.enableCurriedFunction(fn, patterns[0].length)
}

M.Pattern = function(args, fn) {
  this.length = args.length
  this.args = args
  this.fn = fn
}

M.Pattern.prototype.matches = function(args) {
  var ok = true,
      that = this

  args.map(function(arg, index) {
    if (!M.ofType(that.args[index], arg)) {
      ok = false
    }
  })

  return ok
}

M.Pattern.prototype.apply = function(target, args) {
  return this.fn.apply(target, args)
}

// Functors
M.functor = function(type, opts) {
  type.prototype.fmap = M.curry(opts.fmap)
  return type
}

// Types
M.Maybe = function() {}

M.Maybe.Just = function(value) { this.value = value }
M.Maybe.Just.prototype = new M.Maybe
M.Maybe.Just.prototype.isJust = function() { return true }
M.Maybe.Just.prototype.isNothing = function() { return false }

M.Maybe.Nothing = function() {}
M.Maybe.Nothing.prototype = new M.Maybe
M.Maybe.Nothing.prototype.isJust = function() { return false }
M.Maybe.Nothing.prototype.isNothing = function() { return true }
