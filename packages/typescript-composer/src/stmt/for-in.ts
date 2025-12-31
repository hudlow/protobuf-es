import { type Expr, type ExprInput, expr, isExprInput } from "../expr/expr.js";
import { type Ident, type IdentInput, ident, isIdentInput } from "../expr/ident.js";
import { Node } from "../node.js";
import { isObjectWith } from "../plumbing.js";
import type { Transformer } from "../plumbing.js";
import { type BlockInput, blockish, isBlockInput } from "./block.js";
import type { Stmt } from "./stmt.js";

const VAR_FOR_IN_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/for-in");

export interface ForIn {
  [VAR_FOR_IN_SYMBOL]: true;
  readonly kind: "forIn";
  readonly family: "stmt";
  readonly for: Ident;
  readonly in: Expr;
  readonly then: Stmt;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isForIn(v: unknown): v is ForIn {
  return isObjectWith(v, VAR_FOR_IN_SYMBOL);
}

export function forIn(forId: IdentInput, inExpr: ExprInput, then: ForInThenInput): ForIn;
export function forIn(input: ForInInput): ForIn;
export function forIn(...i: ForInTuple | [ForInInput]): ForIn {
  const [itemId, inExpr, thenStmt] =
    i.length === 1 ? [i[0].for, i[0].in, i[0].then] : i;
  const item = ident(itemId);
  const then = typeof thenStmt === "function" ? thenStmt(item) : thenStmt;

  return new ForInNode(item, expr(inExpr), blockish(then));
}

export type ForInInput = { for: IdentInput; in: ExprInput; then: ForInThenInput };
type ForInThenInput = BlockInput | ((item: Ident) => BlockInput);
type ForInTuple = [IdentInput, ExprInput, ForInThenInput];

export function isForInInput(input: unknown): input is ForInInput {
  return (
    isObjectWith(input, "for") && isIdentInput(input.for) &&
    isObjectWith(input, "in") && isExprInput(input.for) &&
    isObjectWith(input, "then") &&
    (
      isBlockInput(Array.isArray(input.then) ? input.then : [input.then]) ||
      typeof input.then === "function")
  );
}

class ForInNode implements ForIn {
  [VAR_FOR_IN_SYMBOL] = true as const;
  readonly #kind = "forIn" as const;
  readonly #family = "stmt" as const;
  readonly #for: Ident;
  readonly #in: Expr;
  readonly #then: Stmt;

  constructor(item: Ident, items: Expr, then: Stmt) {
    this.#for = item;
    this.#in = items;
    this.#then = then;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get for() { return this.#for; }
  get in() { return this.#in; }
  get then() { return this.#then; }

  toString() {
    return `for (const ${this.#for} in ${this.#in}) ${this.#then}`;
  }

  transform(t: Transformer) {
    return t.replace(
      this,
      () =>
        new ForInNode(
          this.#for.transform(t),
          this.#in.transform(t),
          this.#then.transform(t),
        ),
    );
  }
}
