import {
  type Expr,
  exprProxy,
} from "../../expr/expr.js";
import { Transformer } from "../../transformer.js";
import { isObjectWith } from "../../util.js";

const BOOLEAN_LITERAL_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/literal/boolean");

export interface BooleanLiteral {
  [BOOLEAN_LITERAL_SYMBOL]: true;
  readonly kind: "booleanLiteral";
  readonly family: "expr";
  readonly value: boolean;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isBooleanLiteral(v: unknown): v is BooleanLiteral {
  return isObjectWith(v, BOOLEAN_LITERAL_SYMBOL);
}

export function boolean(input: BooleanLiteralInput): BooleanLiteral {
  if (isBooleanLiteral(input)) return input;

  return input ? BOOLEAN_TRUE : BOOLEAN_FALSE;
}

export type BooleanLiteralInput = BooleanLiteral | boolean;

export function isBooleanLiteralInput(input: unknown): input is BooleanLiteralInput {
  return isBooleanLiteral(input) || typeof input === "boolean";
}

class BooleanLiteralNode implements BooleanLiteral {
  readonly [BOOLEAN_LITERAL_SYMBOL] = true as const
  readonly #kind = "booleanLiteral" as const;
  readonly #family = "expr" as const;
  readonly #value: boolean;

  constructor(value: boolean) {
    this.#value = value;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get value() { return this.#value; }

  toString() {
    return `${this.value}n`;
  }

  transform(_: Transformer): BooleanLiteral {
    return exprProxy(this);
  }
}

const BOOLEAN_TRUE = new BooleanLiteralNode(true);
const BOOLEAN_FALSE = new BooleanLiteralNode(false);
