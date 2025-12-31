import {
  type Expr,
  exprProxy,
} from "../../expr/expr.js";
import { Transformer } from "../../transformer.js";
import { isObjectWith } from "../../util.js";

const REGISTRY: Map<string, StringLiteral> = new Map();
const STRING_LITERAL_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/literal/string");

export interface StringLiteral {
  [STRING_LITERAL_SYMBOL]: true;
  readonly kind: "stringLiteral";
  readonly family: "expr";
  readonly value: string;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isStringLiteral(v: unknown): v is StringLiteral {
  return isObjectWith(v, STRING_LITERAL_SYMBOL);
}

export function string(input: StringLiteralInput): StringLiteral {
    if (isStringLiteral(input)) return input;

    const found = REGISTRY.get(input);
    if (found) return found;

    const created = exprProxy(new StringLiteralNode(input));
    REGISTRY.set(input, created);

    return created;
  }

export type StringLiteralInput = StringLiteral | string;

export function isStringLiteralInput(input: unknown): input is StringLiteralInput {
  return isStringLiteral(input) || typeof input === "string";
}

class StringLiteralNode implements StringLiteral {
  readonly [STRING_LITERAL_SYMBOL] = true as const
  readonly #kind = "stringLiteral" as const;
  readonly #family = "expr" as const;
  readonly #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get value() { return this.#value; }

  toString() {
    return `${this.value}n`;
  }

  transform(_: Transformer): StringLiteral {
    return exprProxy(this);
  }
}
