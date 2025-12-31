import { array, type ArrayLiteral, isArrayLiteralInput, type ArrayLiteralInput, isArrayLiteral } from "./array.js";
import { bigint, isBigIntLiteralInput, isBigIntLiteral, type BigIntLiteral } from "./bigint.js";
import { boolean, type BooleanLiteral, isBooleanLiteralInput, isBooleanLiteral } from "./boolean.js";
import { isNumberLiteral, isNumberLiteralInput, number, type NumberLiteral } from "./number.js";
import { string, isStringLiteral, type StringLiteral, isStringLiteralInput } from "./string.js";

export type Literal =
  | ArrayLiteral
  | BigIntLiteral
  | BooleanLiteral
  | NumberLiteral
  | StringLiteral;

export function literal(input: LiteralInput): Literal {
  if (isLiteral(input)) return input;
  if (isArrayLiteralInput(input))
    return array(...input);
  if (isBooleanLiteralInput(input))
    return boolean(input);
  if (isBigIntLiteralInput(input))
    return bigint(input);
  if (isNumberLiteralInput(input))
    return number(input);
  return string(input);
}

export function isLiteral(input: unknown): input is Literal {
  return (
    isArrayLiteral(input) ||
    isBooleanLiteral(input) ||
    isBigIntLiteral(input) ||
    isNumberLiteral(input) ||
    isStringLiteral(input)
  );
}

export function isLiteralInput(input: unknown): input is LiteralInput {
  return (
    isLiteral(input) ||
    isArrayLiteralInput(input) ||
    isBooleanLiteralInput(input) ||
    isBigIntLiteralInput(input) ||
    isNumberLiteralInput(input) ||
    isStringLiteralInput(input)
  );
}

export type RawLiteralInput =
  | ArrayLiteralInput
  | boolean
  | bigint
  | number
  | string;

export type LiteralInput = RawLiteralInput | Literal;

export const LiteralInput = { literal, isLiteral, isLiteralInput };
export * from "./array.js";
export * from "./bigint.js";
export * from "./boolean.js";
export * from "./number.js";
export * from "./string.js";
