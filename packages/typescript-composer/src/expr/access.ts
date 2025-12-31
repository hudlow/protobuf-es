import { Transformer } from "../transformer.js";
import { isObjectWith} from "../util.js";
import {
  expr,
  exprProxy,
  isExprInput,
} from "./expr.js";
import type { Expr, ExprInput } from "./expr.js";
import { type IdentInput, ident, isIdent, isIdentInput } from "./ident.js";

const ACCESS_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/access");

export interface Access {
  [ACCESS_SYMBOL]: true;
  readonly kind: "access";
  readonly family: "expr";
  readonly base: Expr;
  readonly key: Expr;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isAccess(v: unknown): v is Access {
  return isObjectWith(v, ACCESS_SYMBOL);
}

export function access(
  base: IdentInput | ExprInput,
  key: IdentInput | ExprInput,
  ...additionalKeys: (IdentInput | ExprInput)[]
): Access {
  const node = exprProxy(
    new AccessNode(
      isIdentInput(base) ? ident(base) : expr(base),
      isIdentInput(key) ? ident(key) : expr(key),
    ),
  );

  if (additionalKeys.length > 0)
    return access(
      node,
      additionalKeys[0],
      ...additionalKeys.slice(1),
    );

  return node;
}

export type AccessInput = Parameters<typeof access>;
export function isAccessInput(input: unknown): input is AccessInput {
  return (
    Array.isArray(input) &&
    input.length >= 2 &&
    input.every((i) => isExprInput(i))
  );
}

class AccessNode implements Access {
  [ACCESS_SYMBOL] = true as const;
  static readonly kind = "access" as const;
  readonly #family = "expr" as const;
  readonly #kind = "access" as const;
  readonly #base: Expr;
  readonly #key: Expr;

  constructor(
    base: Expr,
    key: Expr,
  ) {
    this.#base = base;
    this.#key = key;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get base() { return this.#base; }
  get key() { return this.#key; }

  toString(): string {
    if (isIdent(this.#key)) return `${this.#base}.${this.#key}`;

    return `${this.#base}[${this.#key}]`;
  }

  transform(_: Transformer): Access {
    return exprProxy(this);
  }
}
