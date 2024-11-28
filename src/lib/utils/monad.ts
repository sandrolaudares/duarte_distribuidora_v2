export class Monad<T> {
  private value: T

  private constructor(value: T) {
    this.value = value
  }

  // Monad's `of` - Wraps a value into a Monad
  static of<T>(value: T): Monad<T> {
    return new Monad(value)
  }

  // Monad's `flatMap` - Applies a function that returns another Monad
  flatMap<U>(fn: (value: T) => Monad<U>): Monad<U> {
    return fn(this.value)
  }

  // Functor's `map` - Applies a function to the value but stays in the Monad context
  map<U>(fn: (value: T) => U): Monad<U> {
    return this.flatMap(value => Monad.of(fn(value)))
  }

  // Extract the value (used only at the end of the chain)
  get(): T {
    return this.value
  }
}
