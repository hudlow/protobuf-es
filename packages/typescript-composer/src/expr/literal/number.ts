import {
  type Expr,
  exprProxy,
} from "../../expr/expr.js";
import { Transformer } from "../../transformer.js";
import { isObjectWith } from "../../util.js";

const REGISTRY: Map<number, NumberLiteral> = new Map();
const NUMBER_LITERAL_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/literal/number");

export interface NumberLiteral {
  [NUMBER_LITERAL_SYMBOL]: true;
  readonly kind: "numberLiteral";
  readonly family: "expr";
  readonly value: number;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isNumberLiteral(v: unknown): v is NumberLiteral {
  return isObjectWith(v, NUMBER_LITERAL_SYMBOL);
}

export function number(input: NumberLiteralInput): NumberLiteral {
    if (isNumberLiteral(input)) return input;

    const found = REGISTRY.get(input);
    if (found) return found;

    const created = exprProxy(new NumberLiteralNode(input));
    REGISTRY.set(input, created);

    return created;
  }

export type NumberLiteralInput = NumberLiteral | number;

export function isNumberLiteralInput(input: unknown): input is NumberLiteralInput {
  return isNumberLiteral(input) || typeof input === "number";
}

class NumberLiteralNode implements NumberLiteral {
  readonly [NUMBER_LITERAL_SYMBOL] = true as const
  readonly #kind = "numberLiteral" as const;
  readonly #family = "expr" as const;
  readonly #value: number;

  constructor(value: number) {
    this.#value = value;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get value() { return this.#value; }

  toString() {
    return `${this.value}n`;
  }

  transform(_: Transformer): NumberLiteral {
    return exprProxy(this);
  }
}
