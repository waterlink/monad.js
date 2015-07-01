var curry = require("../src/monad").curry
var functor = require("../src/monad").functor
var Maybe = require("../src/monad").Maybe

context = describe

describe("currying", function() {
  describe("curried function with no args", function() {
    var fn = curry(function() { return "a_result" })

    it("returns a result when called without arguments", function() {
      expect(fn()).toEqual("a_result")
    })
  })

  describe("curried function with one arg", function() {
    var fn = curry(function(name) { return "hello, " + name })

    it("returns a result when called with one argument", function() {
      expect(fn("world")).toEqual("hello, world")
    })

    it("returns new curried function when called without arguments", function() {
      expect(fn()()()()()()()()()()("Howard")).toEqual("hello, Howard")
    })
  })

  describe("curried function with multiple arg", function() {
    var fn = curry(function(a, b, c) { return "value: " + a + b + c })

    it("returns a result when called with all arguments", function() {
      expect(fn(1, 2, 3)).toEqual("value: 123")
    })

    it("returns new curried function when called with not all arguments", function() {
      expect(fn(1, 2)(3)).toEqual("value: 123")
      expect(fn(1)(2, 3)).toEqual("value: 123")
      expect(fn(1)(2)(3)).toEqual("value: 123")

      expect(fn()()()()(1)()()()()()()()(2, 3)).toEqual("value: 123")
    })

    context("when used with objects", function() {
      var proto = { fn: curry(function(a, b, c) { return "me+value: " + this.me + a + b + c }) },
          obj = { me: 79, __proto__: proto }

      it("returns a result when called with all arguments", function() {
        expect(obj.fn(1, 2, 3)).toEqual("me+value: 79123")
      })

      it("returns new curried function when called with not all arguments", function() {
        expect(obj.fn(1, 2)(3)).toEqual("me+value: 79123")
        expect(obj.fn(1)(2, 3)).toEqual("me+value: 79123")
        expect(obj.fn(1)(2)(3)).toEqual("me+value: 79123")

        expect(obj.fn()()()()(1)()()()()()()()(2, 3)).toEqual("me+value: 79123")
      })
    })
  })
})

describe("functors", function() {
  var mult = curry(function(a, b) { return a * b })

  describe("array functor example", function() {
    functor(Array, { fmap: Array.prototype.map })

    it("works as expected", function() {
      expect([1, 2, 3, 5].fmap()()()()(mult(2))).toEqual([2, 4, 6, 10])
    })
  })

  describe("maybe functor example", function() {
    functor(Maybe, {
      fmap: function(fn) {
        if (this.isJust()) { return new Maybe.Just(fn(this.value)) }
        if (this.isNothing()) { return new Maybe.Nothing }
      }
    })

    it("works as expected", function() {
      expect(new Maybe.Just(71).fmap(mult(3))).toEqual(new Maybe.Just(213))
      expect(new Maybe.Nothing().fmap(mult(3))).toEqual(new Maybe.Nothing)
    })
  })
})
