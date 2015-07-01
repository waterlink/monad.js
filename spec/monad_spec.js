var m = require("../src/monad")
var curry = m.curry
var pattern = m.pattern
var match = m.match
var _ = m._
var functor = m.functor
var Maybe = m.Maybe

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

describe("pattern matching", function() {
  var Cat = function() {},
      Dog = function() {},
      CatFood = function() {},
      DogFood = function() {}

  var cat = new Cat,
      dog = new Dog,
      catFood = new CatFood,
      dogFood = new DogFood

  describe("a multi-argument function", function() {
    var eat = match(
      pattern(Cat, CatFood, Number,
        function(cat, food, amount) {
          return new Maybe.Just("cat ate " + amount + " of cat food")
        }),

      pattern(Dog, DogFood, Number,
        function(dog, food, amount) {
          return new Maybe.Just("dog ate " + amount + " of dog food")
        }),

      pattern(_, _, _,
        function() { return new Maybe.Nothing })
    )

    it("chooses function correctly when pattern matches", function() {
      expect(eat(cat)(catFood, 4)).toEqual(new Maybe.Just("cat ate 4 of cat food"))
      expect(eat(dog, dogFood)(3)).toEqual(new Maybe.Just("dog ate 3 of dog food"))
    })

    it("works correctly with 'all-catching' _ patterns", function() {
      expect(eat(cat, catFood, "hello world")).toEqual(new Maybe.Nothing)
      expect(eat(cat, dog, 7)).toEqual(new Maybe.Nothing)
      expect(eat(cat, dog, 7)).toEqual(new Maybe.Nothing)
      expect(eat(dog, catFood, 3)).toEqual(new Maybe.Nothing)
      expect(eat("hello world", catFood, 3)).toEqual(new Maybe.Nothing)
    })
  })

  describe("a function with receiver", function() {
    cat.name = "kitty"

    cat.eat = match(
      pattern(CatFood, Number,
        function(food, amount) {
          return this.name + " has ate " + amount + " of cat food"
        }),

      pattern(_, _,
        function(_, _) { return this.name + " can't eat that :(" })
    )

    it("calls functions correctly on receiver", function() {
      expect(cat.eat(catFood, 3)).toEqual("kitty has ate 3 of cat food")
      expect(cat.eat(catFood)()()()(3)).toEqual("kitty has ate 3 of cat food")
      expect(cat.eat(dogFood, 3)).toEqual("kitty can't eat that :(")
    })
  })

  describe("factorial example", function() {
    var factorial = match(
      pattern(0,
        function(_) { return 1 }),

      pattern(Number,
        function(n) { return n * factorial(n - 1) })
    )

    it("works with raw values in pattern correctly", function() {
      expect(factorial(0)).toEqual(1)
      expect(factorial(5)).toEqual(120)
    })
  })
})
