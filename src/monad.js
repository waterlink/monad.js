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
