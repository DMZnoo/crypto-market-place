import bn from 'bignumber.js'
import Decimal from 'decimal.js'

export const RAY: bigint = BigInt('1000000000000000000000000000')
export const WAD: bigint = BigInt('1000000000000000000')

// counts the number of zeros immediately after the decimal point
// 0.0012 => 2; 0.12 => 0
function countZeroDecimals(num: number) {
  const strNum = num.toString()
  const decimalIndex = strNum.indexOf('.')
  if (decimalIndex === -1) {
    return 0
  }
  let count = 0
  for (let i = decimalIndex + 1; i < strNum.length; i++) {
    if (strNum[i] === '0') {
      count++
    } else {
      break
    }
  }
  return count
}

/**
 * Use when displaying values denominated in ETH.
 * @param num
 */
export const formatETH = (num: number): number => {
  if (num > 0) {
    if (num < 1) {
      if (countZeroDecimals(num) > 4) {
        return Number(num.toExponential(4))
      } else {
        // 4 decimal points at max, remove trailing zeros
        return Number(
          num
            .toFixed(4)
            .toString()
            .replace(/\.?0+$/, '')
        )
      }
    } else {
      return Number(parseFloat(num.toString()).toFixed(2))
    }
  } else if (num == 0) {
    return 0
  } else {
    return Number(parseFloat(num.toString()).toFixed(2))
  }
}

/**
 * Use when displaying values denominated in dollars.
 * @param num The number to format.
 */
export const formatDollars = (num: number): string => {
  if (num > 0) {
    const dollars = num
      .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      .substring(1)
    return dollars
  } else if (num == 0) {
    return '0'
  }
  return '' // negative
}

/**
 * Checks that a number has decimal places less than the specified max.
 * @param num The decimal number to be checked.
 * @param max The maximum number of decimal places this number shouold have.
 */
const decimalPointsLessThanMax = (num: number, max: number): boolean => {
  const numStr = num.toString()
  const parts = numStr.split('.')
  return parts.length < 2 || parts[1].length < max
}

const countDecimals = (val: number | string): number => {
  // convert the value to a string if it's not already
  const valStr = val.toString()

  // check if there's a decimal point in the string
  if (valStr.includes('.')) {
    // the number of decimal places is the length of the substring after the decimal point
    return valStr.split('.')[1].length
  } else {
    // if there's no decimal point, the number of decimal places is 0
    return 0
  }
}

/**
 * Converts a decimal number of type String to a BigInt representation.
 * @param str The string.
 * @param scale Number of decimals aka precision of the BigInt.
 */
export const strToBigInt = (str: string, scale: number): bigint => {
  if (str == null) {
    return BigInt(0)
  }
  if (str == '0') {
    return BigInt(0)
  }
  str = str.toString()
  const decimalPlaces = countDecimals(str)

  let scaledStr: string
  if (decimalPlaces > scale) {
    // if number of decimal places larger than scale, truncate extra digits.
    const parts = str.split('.')
    if (parts.length > 1) {
      const integerPart = parts[0]
      const decimalPart = parts[1].substring(0, scale)
      scaledStr =
        integerPart + decimalPart + '0'.repeat(scale - decimalPart.length)
    } else {
      scaledStr = str + '0'.repeat(scale)
    }
    // throw new Error("strToBigInt: The number has more decimal places than the scale.")
  } else {
    scaledStr =
      str.toString().replace('.', '') + '0'.repeat(scale - decimalPlaces)
  }
  // add more trailing zeroes equal to (scale - the current number of decimal places)

  return BigInt(scaledStr)
}

/**
 * Multiplies two big int values.
 * @param a
 * @param b
 * @param scale
 * @returns value with precision equal to a's precision + b's precision - scale precision
 */
export const bigIntMul = (a: bigint, b: bigint, scale: number): bigint => {
  let product = (BigInt(a) * BigInt(b)).toString()
  if (product.toString().length > scale) {
    product = product.slice(0, -scale)
  } else {
    return BigInt(0)
  }
  return BigInt(product)
}

/**
 * Multiply bigint and round up.
 */
export const bigIntMulRound = (
  a: bigint,
  scaleA: number,
  b: bigint,
  scaleB: number,
  scale: number,
  rounding: 'up' | 'down'
): bigint => {
  let numZeroes = scaleA + scaleB - scale
  const toDivide = BigInt('1' + '0'.repeat(numZeroes))
  const truncated = (a * b) / toDivide
  if (rounding === 'up') {
    if (truncated * toDivide < a * b) {
      return truncated + BigInt(1)
    } else {
      return truncated
    }
  } else {
    return truncated
  }
}

/**
 * Uses the bn library
 */
export const bigIntMulDiv = (_a: string, _b: string, _c: string): string => {
  // catch divide by zero
  if (parseInt(_c) == 0) {
    return '0'
  }

  bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
  const a = new bn(_a)
  const b = new bn(_b)
  const c = new bn(_c)
  return a.multipliedBy(b).dividedBy(c).integerValue(bn.ROUND_DOWN).toString()
}

/**
 * Formats big integer to string
 * @param val Big integer to be formatted.
 * @param scale Precision of the big integer.
 * @param dec Number of decimal points we want to show.
 */
export const formatBigInt = (
  val: bigint,
  scale: number,
  dec: number
): string => {
  if (val == null) {
    return '0'
  }

  const valStr = val.toString()
  const valLength = valStr.length

  const decimalPlaces = countDecimals(valStr)
  if (decimalPlaces > 18) {
    throw new Error(
      'formatBigInt: The number has more decimal places than the scale.'
    )
  }

  let formattedStr: string

  // insert decimal point
  if (valLength > scale) {
    // decimal point is within the number
    formattedStr = valStr.slice(0, -scale) + '.' + valStr.slice(-scale)
  } else {
    // decimal point is at the start (number is less than scale)
    formattedStr = '0.' + '0'.repeat(scale - valLength) + valStr
  }

  // truncate to the specified number of decimal places
  const dotIndex = formattedStr.indexOf('.')
  if (dotIndex !== -1) {
    formattedStr = formattedStr.slice(0, dotIndex + dec + 1)
  }

  // remove trailing zeroes and decimal point if necessary
  formattedStr = formattedStr.replace(/\.?0+$/, '')

  return formattedStr
}

// price = ( sqrtPriceX96 / 2^96 ) ^ 2
// price = sqrtPriceX96 ^ 2 / 2 ^ 192
export const sqrtPriceX96ToDecimalPrice = (sqrtPriceX96: string): string => {
  bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
  const sqrtPriceX96Bn = new bn(sqrtPriceX96)
  const WAD = new bn(1e18)
  const two196 = new bn('2').pow(192) // 2^196
  // const price = sqrtPriceX96Bn.pow('2').multipliedBy(WAD).dividedBy(two196)
  const price = sqrtPriceX96Bn.pow('2').dividedBy(two196)

  return price.toString()
}

export const decimalPriceToSqrtPriceX96 = (decimalPrice: string): string => {
  bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
  // compare two methods
  const decimalPriceBn = new bn(decimalPrice) // how many decimal points?
  const two192 = new bn('2').pow(192)
  const sqrtPriceX96 = decimalPriceBn.multipliedBy(two192).sqrt()

  return sqrtPriceX96.integerValue(bn.ROUND_DOWN).toString()
}

export const _decimalPriceToSqrtPriceX96 = (decimalPrice: string): string => {
  bn.config({ EXPONENTIAL_AT: 999999, DECIMAL_PLACES: 40 })
  const decimalPriceBn = new bn(decimalPrice) // how many decimal points?
  const sqrtPriceX96 = decimalPriceBn.sqrt().multipliedBy(new bn('2').pow(96))

  // sqrtPriceX96.integerValue(bn.ROUND_DOWN)
  return sqrtPriceX96.integerValue(bn.ROUND_DOWN).toString()
}

/**
 * Converts between wei (18 decimals) and dollars (2 decimals).
 * @val Always takes in the precise bigint value and chooses how to convert
 * based on the `targetUnit`.
 * @price Chainlink price feed with 8 decimals
 * @dec Number of decimals to show for ETH values
 * @returns String for displaying values as information, not for calculation.
 * @return Null if the `price` is null
 */
export type Currency = 'WEI' | 'DOLLAR'
export const weiDollarToggle = (
  val: bigint | null | undefined,
  price: bigint | null,
  currency: string,
  dec: number
): string | null => {
  if (price === null || val === null || val === undefined) {
    return null
  }
  if (currency === 'WEI') {
    return formatBigInt(val, 18, dec)
  } else if (currency === 'DOLLAR') {
    // val [18 decimals]
    // USD/ETH price [8 decimals]
    const dollars: bigint = val * price
    const dollarsString = formatBigInt(dollars, 26, 2)
    const dollarsNum = parseFloat(dollarsString)

    const form = formatDollars(dollarsNum)
    return form
  } else {
    return null
  }
}

// val is per second borrow rate in big int from the contract
export const perSecondToAnnualRate = (
  val: bigint,
  scale: number,
  dec: number
): string => {
  return new Decimal(val.toString())
    .dividedBy(new Decimal(1e27))
    .pow(31536000)
    .sub(1)
    .toFixed(dec)
}

export const perSecondToAnnualRatePerc = (
  val: bigint,
  scale: number,
  dec: number
): string => {
  return new Decimal(val.toString())
    .dividedBy(new Decimal(1e27))
    .add(1)
    .pow(31536000)
    .sub(1)
    .mul(100)
    .toFixed(dec)
}
// truncates number of digits equal to the difference between
// currentScale and newScale.
// newScale must be less than or equal to currentScale
// value must be an integer with no decimal points
export const convertPrecision = (
  value: string,
  currentScale: number,
  newScale: number
): string => {
  if (typeof value !== 'string') {
    throw new TypeError('precisionConversion: value must be a string')
  }
  if (newScale > currentScale) {
    throw new Error(
      'precisionConversion: newScale must be less than or equal to currentScale'
    )
  }
  const scaleDifference = currentScale - newScale

  if (scaleDifference >= value.length) {
    return '0'
  }
  if (scaleDifference === 0) {
    return value
  }

  const truncatedValue = value.substring(0, value.length - scaleDifference)
  return truncatedValue
}
