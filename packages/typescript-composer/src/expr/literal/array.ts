import {
  type Expr,
  expr,
  exprProxy,
  isExpr,
} from "../../expr/expr.js";
import { Transformer } from "../../transformer.js";
import { isObjectWith} from "../../util.js";
import { type RawLiteralInput, isLiteralInput, literal } from "./literal.js";

const ARRAY_LITERAL_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/literal/array");

export interface ArrayLiteral {
  [ARRAY_LITERAL_SYMBOL]: true;
  readonly kind: "arrayLiteral";
  readonly family: "expr";
  readonly values: Expr[];
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isArrayLiteral(v: unknown): v is ArrayLiteral {
  return isObjectWith(v, ARRAY_LITERAL_SYMBOL);
}

export function array(...input: ArrayLiteralInput): ArrayLiteral {
  const i = input.map((v) => (isLiteralInput(v) ? literal(v) : expr(v)));

  return exprProxy(new ArrayLiteralNode(i));
}

export type ArrayLiteralInput = (Expr | RawLiteralInput)[];

export function isArrayLiteralInput(input: unknown): input is ArrayLiteralInput {
  return (
    Array.isArray(input) && input.every((i) => isExpr(i) || isLiteralInput(i))
  );
}

class ArrayLiteralNode implements ArrayLiteral {
  readonly [ARRAY_LITERAL_SYMBOL] = true as const
  readonly #kind = "arrayLiteral" as const;
  readonly #family = "expr" as const;
  readonly #values: Expr[];

  constructor(values: Expr[]) {
    this.#values = values;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get values() { return this.#values; }

  toString() {
    return `[${this.#values.join(", ")}]`;
  }

  transform(t: Transformer): ArrayLiteral {
    return t.replace(exprProxy(this), () =>
      array(...this.#values.map((v) => v.transform(t))),
    );
  }
}

