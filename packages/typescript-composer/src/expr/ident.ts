import { isObjectWith } from "../util.js";
import type { Transformer } from "../transformer.js";
import { type Expr, exprProxy } from "./expr.js";

const IDENT_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/ident");

export interface Ident {
  [IDENT_SYMBOL]: true;
  readonly kind: "ident";
  readonly family: "expr";
  readonly id: string;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isIdent(v: unknown): v is Ident {
  return isObjectWith(v, IDENT_SYMBOL);
}

export function ident(input: IdentInput): Ident {
  if (isIdent(input)) return input;
  if (isObjectInput(input)) return ident(input.id);

  return exprProxy(new IdentNode(input));
}

export type IdentInput = string | { id: string } | IdentNode;

export function isIdentInput(v: unknown): v is IdentInput {
  return (
    isIdent(v) ||
    isObjectInput(v) ||
    typeof v === "string"
  );
}

function isObjectInput(input: unknown): input is { id: string } {
  return isObjectWith(input, "ident") && typeof input.ident === "string";
}

class IdentNode implements Ident {
  readonly [IDENT_SYMBOL] = true as const;
  readonly #family = "expr" as const;
  readonly #kind = "ident" as const;
  readonly #id: string;

  constructor(id: string) {
    this.#id = id;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get id() { return this.#id; }

  toString() {
    return this.id;
  }

  transform(_: Transformer): Ident {
    return exprProxy(this);
  }
}
