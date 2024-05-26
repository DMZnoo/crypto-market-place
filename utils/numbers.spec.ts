import { describe, expect, test } from 'vitest'
import { formatDollars, formatETH } from './number'

describe('formatETH should - ', () => {
  test('return 0 when the input is 0', () => {
    const res = formatETH(0)
    expect(0).toBe(0)
  })

  test('return exponential when the input has more than 4 decimal places', () => {
    const res = formatETH(4.44445)
    expect(res).toBe('4.44445e+0')
  })

  test('not return trailing 0', () => {
    const res = formatETH(1.0)
    expect(res).toBe(1)
  })
})

describe('formatDollars should - ', () => {
  test('return 0 when the input is 0', () => {
    const res = formatDollars(0)
    expect(res).toBe(0)
  })

  test('return decimal points up to 2', () => {
    const res = formatDollars(1.222)
    expect(res).toBe(1.22)
  })

  test('return no trailing 0', () => {
    const res = formatDollars(1.2)
    expect(res).toBe(1.2)
  })
})
