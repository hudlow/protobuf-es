import { Transformer } from "../transformer.js";
import { isObjectWith } from "../util.js";
import {
  type Expr,
  type ExprInput,
  expr,
  exprProxy,
  isExprInput,
} from "./expr.js";

const PARENS_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/parens");

export interface Parens {
  [PARENS_SYMBOL]: true;
  readonly kind: "parens";
  readonly family: "expr";
  readonly value: Expr;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isParens(v: unknown): v is Parens {
  return isObjectWith(v, PARENS_SYMBOL);
}

export function parens(input: ExprInput): Parens {
  return exprProxy(new ParensNode(expr(input)));
}

export function isInput(input: unknown): input is ParensInput {
  return isExprInput(input);
}

class ParensNode implements Parens {
  readonly [PARENS_SYMBOL] = true as const;
  readonly #family = "expr" as const;
  readonly #kind = "parens" as const;
  readonly #value: Expr;

  constructor(value: Expr) {
    this.#value = value;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get value() { return this.#value; }

  toString(): string {
    return `(${this.#value})`;
  }

  transform(_: Transformer): Parens {
    return exprProxy(this);
  }
}

export type ParensInput = ExprInput;
