import type { Result } from '../types/index.js'

/**
 * Creates a successful Result tuple
 */
export function ok<T>(data: T): Result<T> {
  return [null, data]
}

/**
 * Creates an error Result tuple
 */
export function err<E extends Error>(error: E): Result<never, E> {
  return [error, null]
}

/**
 * Type guard to check if a Result is an error
 */
export function isErr<T, E extends Error>(result: Result<T, E>): result is [E, null] {
  return result[0] !== null
}

/**
 * Type guard to check if a Result is successful
 */
export function isOk<T, E extends Error>(result: Result<T, E>): result is [null, T] {
  return result[0] === null
}
