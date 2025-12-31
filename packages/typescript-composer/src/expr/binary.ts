import { Transformer } from "../transformer.js";
import { isObjectWith } from "../util.js";
import {
  type Expr,
  type ExprInput,
  expr,
  exprProxy,
  isExprInput,
} from "./expr.js";

const BINARY_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/binary");

export interface Binary {
  [BINARY_SYMBOL]: true;
  readonly kind: "binary";
  readonly family: "expr";
  readonly left: Expr;
  readonly op: BinaryOperator;
  readonly right: Expr;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isBinary(v: unknown): v is Binary {
  return isObjectWith(v, BINARY_SYMBOL);
}

const OPERATORS =  [
  "=", //   assignment

  "??", //  nullish coalescing
  "??=", // nullish coalescing + assignment

  ">", //   greater than
  ">=", //  greater than or equal
  "<", //   less than
  "<=", //  less than or equal

  "==", //  equality
  "!=", //  inequality

  "===", // strict equality
  "!==", // strict inequality

  "+", //   addition
  "/", //   division
  "**", //  exponentiation
  "*", //   multiplication
  "%", //   remainder
  "-", //   subtraction

  "/=", //  division           + assignment
  "**=", // exponentiation    + assignment
  "*=", //  multiplication     + assignment
  "%=", //  remainder          + assignment
  "-=", //  subtraction        + assignment
  "+=", //  addition           + assignment

  "&&", //  logical and
  "||", //  logical or

  "&&=", // logical and        + assignment
  "||=", // logical or         + assignment

  "<<", //  left shift
  ">>", //  right shift

  "<<=", // left shift         + assignment
  ">>=", // right shift        + assignment

  "&", //   bitwise and
  "|", //   bitwise or
  "^", //   bitwise xor

  "&=", //  bitwise and        + assignment
  "|=", //  bitwise or         + assignment
  "^=", //  bitwise xor        + assignment

  "in",
  "instanceof",
] as const;

type BinaryOperator = (typeof OPERATORS)[number];

export function binary(
  leftOperand: ExprInput,
  operator: BinaryOperator,
  rightOperand: ExprInput,
): Binary {
  return exprProxy(
    new BinaryNode(expr(leftOperand), operator, expr(rightOperand)),
  );
}

export function isBinaryInput(input: unknown): input is BinaryInput {
  return (
    Array.isArray(input) &&
    input.length === 3 &&
    isExprInput(input[0]) && // left
    OPERATORS.includes(input[1]) && // op
    isExprInput(input[2]) // right
  );
}

export type BinaryInput = Parameters<typeof binary>;

class BinaryNode implements Binary {
  [BINARY_SYMBOL] = true as const;
  readonly #family = "expr" as const;
  readonly #kind = "binary" as const;
  readonly #left: Expr;
  readonly #op: BinaryOperator;
  readonly #right: Expr;

  constructor(
    left: Expr,
    op: BinaryOperator,
    right: Expr,
  ) {
    this.#left = left;
    this.#op = op;
    this.#right = right;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get left() { return this.#left; }
  get op() { return this.#op; }
  get right() { return this.#right; }

  toString() {
    return `${this.#left} ${this.#op} ${this.#right}`;
  }

  transform(_: Transformer): Binary {
    return exprProxy(this);
  }
}
