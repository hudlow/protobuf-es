import { type Expr, type ExprInput, expr, isExprInput } from "../expr/expr.js";
import { type Ident, type IdentInput, ident, isIdentInput } from "../expr/ident.js";
import { Node } from "../node.js";
import { isObjectWith } from "../plumbing.js";
import type { Transformer } from "../plumbing.js";
import { type BlockInput, blockish, isBlockInput } from "./block.js";
import type { Stmt } from "./stmt.js";

const VAR_FOR_OF_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/for-of");

export interface ForOf {
  [VAR_FOR_OF_SYMBOL]: true;
  readonly kind: "forIn";
  readonly family: "stmt";
  readonly for: Ident;
  readonly of: Expr;
  readonly then: Stmt;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isForOf(v: unknown): v is ForOf {
  return isObjectWith(v, VAR_FOR_OF_SYMBOL);
}

export function forIn(forId: IdentInput, ofExpr: ExprInput, then: ForOfThenInput): ForOf;
export function forIn(input: ForOfInput): ForOf;
export function forIn(...i: ForOfTuple | [ForOfInput]): ForOf {
  const [itemId, ofExpr, thenStmt] =
    i.length === 1 ? [i[0].for, i[0].of, i[0].then] : i;
  const item = ident(itemId);
  const then = typeof thenStmt === "function" ? thenStmt(item) : thenStmt;

  return new ForOfNode(item, expr(ofExpr), blockish(then));
}

export type ForOfInput = { for: IdentInput; of: ExprInput; then: ForOfThenInput };
type ForOfThenInput = BlockInput | ((item: Ident) => BlockInput);
type ForOfTuple = [IdentInput, ExprInput, ForOfThenInput];

export function isForOfInput(input: unknown): input is ForOfInput {
  return (
    isObjectWith(input, "for") && isIdentInput(input.for) &&
    isObjectWith(input, "in") && isExprInput(input.for) &&
    isObjectWith(input, "then") &&
    (
      isBlockInput(Array.isArray(input.then) ? input.then : [input.then]) ||
      typeof input.then === "function")
  );
}

class ForOfNode implements ForOf {
  [VAR_FOR_OF_SYMBOL] = true as const;
  readonly #kind = "forIn" as const;
  readonly #family = "stmt" as const;
  readonly #for: Ident;
  readonly #of: Expr;
  readonly #then: Stmt;

  constructor(item: Ident, items: Expr, then: Stmt) {
    this.#for = item;
    this.#of = items;
    this.#then = then;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get for() { return this.#for; }
  get of() { return this.#of; }
  get then() { return this.#then; }

  toString() {
    return `for (const ${this.for} of ${this.of}) ${this.then}`;
  }

  transform(t: Transformer) {
    return t.replace(
      this,
      () =>
        new ForOfNode(
          this.#for.transform(t),
          this.#of.transform(t),
          this.#then.transform(t),
        ),
    );
  }
}
