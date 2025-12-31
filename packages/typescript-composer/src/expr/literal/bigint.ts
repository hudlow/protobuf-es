import {
  type Expr,
  exprProxy,
} from "../../expr/expr.js";
import { Transformer } from "../../transformer.js";
import { isObjectWith } from "../../util.js";

const REGISTRY: Map<bigint, BigIntLiteral> = new Map();
const BIGINT_LITERAL_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/literal/bigint");

export interface BigIntLiteral {
  [BIGINT_LITERAL_SYMBOL]: true;
  readonly kind: "bigintLiteral";
  readonly family: "expr";
  readonly value: bigint;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isBigIntLiteral(v: unknown): v is BigIntLiteral {
  return isObjectWith(v, BIGINT_LITERAL_SYMBOL);
}

export function bigint(input: BigIntLiteralInput): BigIntLiteral {
    if (isBigIntLiteral(input)) return input;

    const found = REGISTRY.get(input);
    if (found) return found;

    const created = exprProxy(new BigIntLiteralNode(input));
    REGISTRY.set(input, created);

    return created;
  }

export type BigIntLiteralInput = BigIntLiteral | bigint;

export function isBigIntLiteralInput(input: unknown): input is BigIntLiteralInput {
  return isBigIntLiteral(input) || typeof input === "bigint";
}

class BigIntLiteralNode implements BigIntLiteral {
  readonly [BIGINT_LITERAL_SYMBOL] = true as const
  readonly #kind = "bigintLiteral" as const;
  readonly #family = "expr" as const;
  readonly #value: bigint;

  constructor(value: bigint) {
    this.#value = value;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get value() { return this.#value; }

  toString() {
    return `${this.value}n`;
  }

  transform(_: Transformer): BigIntLiteral {
    return exprProxy(this);
  }
}
