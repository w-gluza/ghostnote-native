export type Fraction = {
  numerator: number;
  denominator: number;
};

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : greatestCommonDivisor(b, a % b);
}

export function fraction(numerator: number, denominator = 1): Fraction {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new Error(`Fraction ${numerator}/${denominator} is not whole`);
  }
  if (denominator === 0) {
    throw new Error(`Fraction ${numerator}/0 has no value`);
  }
  const sign = denominator < 0 ? -1 : 1;
  const divisor = greatestCommonDivisor(numerator, denominator) || 1;
  return {
    numerator: (sign * numerator) / divisor,
    denominator: (sign * denominator) / divisor,
  };
}

export const ZERO = fraction(0);
export const ONE = fraction(1);

export function add(a: Fraction, b: Fraction) {
  return fraction(
    a.numerator * b.denominator + b.numerator * a.denominator,
    a.denominator * b.denominator,
  );
}

export function multiply(a: Fraction, b: Fraction) {
  return fraction(a.numerator * b.numerator, a.denominator * b.denominator);
}

export function divide(a: Fraction, b: Fraction) {
  return fraction(a.numerator * b.denominator, a.denominator * b.numerator);
}

export function compare(a: Fraction, b: Fraction) {
  return a.numerator * b.denominator - b.numerator * a.denominator;
}

export function equals(a: Fraction, b: Fraction) {
  return compare(a, b) === 0;
}

export function toNumber(value: Fraction) {
  return value.numerator / value.denominator;
}

export function isReduced(value: Fraction) {
  return (
    Number.isInteger(value.numerator) &&
    Number.isInteger(value.denominator) &&
    value.denominator > 0 &&
    greatestCommonDivisor(value.numerator, value.denominator) <= 1 &&
    (value.numerator !== 0 || value.denominator === 1)
  );
}
