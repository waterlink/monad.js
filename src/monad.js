exports = exports || {}

M = exports

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
