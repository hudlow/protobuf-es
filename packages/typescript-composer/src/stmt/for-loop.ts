import { type Expr, type ExprInput, expr, isExprInput, VarDeclListInput, VarDeclList } from "../expr/expr.js";
import { type Ident, type IdentInput, ident, isIdentInput } from "../expr/ident.js";
import { Node } from "../node.js";
import { isObjectWith } from "../plumbing.js";
import type { Transformer } from "../plumbing.js";
import { type BlockInput, blockish, isBlockInput } from "./block.js";
import { varDeclStmt, type Stmt, type StmtInput } from "./stmt.js";

const VAR_FOR_LOOP_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/for-loop");

export interface ForLoop {
  [VAR_FOR_LOOP_SYMBOL]: true;
  readonly kind: "forLoop";
  readonly family: "stmt";
  readonly for: Ident;
  readonly cond: ExprInput;
  readonly each: Expr;
  readonly then: Stmt;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isForLoop(v: unknown): v is ForLoop {
  return isObjectWith(v, VAR_FOR_LOOP_SYMBOL);
}

export function forLoop(forDecl: VarDeclListInput, condExpr: ExprInput, eachExpr: ExprInput, then: StmtInput): ForLoop;
export function forLoop(input: ForLoopInput): ForLoop;
export function forLoop(...input: ForLoopTuple | [ForLoopInput]): ForLoop {
  if (input.length === 1)
    return new ForLoopNode(
      varDeclStmt({ let: input[0].for }),
      expr(input[0].cond),
      expr(input[0].each),
      blockish(input[0].then),
    );

  return new ForLoopNode(
    varDeclStmt({ let: input[0] }),
    expr(input[1]),
    expr(input[2]),
    blockish(input[3]),
  );
}

export type ForLoopInput = {
  for: VarDeclListInput;
  cond: ExprInput;
  each: ExprInput;
  then: StmtInput;
};
type ForLoopTuple = [
  VarDeclListInput,
  ExprInput,
  ExprInput,
  StmtInput,
];

export function isForLoopInput(input: unknown): input is ForLoopInput {
  return (
    isObjectWith(input, "for") && isIdentInput(input.for) &&
    isObjectWith(input, "in") && isExprInput(input.for) &&
    isObjectWith(input, "then") &&
    (
      isBlockInput(Array.isArray(input.then) ? input.then : [input.then]) ||
      typeof input.then === "function")
  );
}

class ForLoopNode implements ForLoop {
  [VAR_FOR_LOOP_SYMBOL] = true as const;
  readonly #kind = "forLoop" as const;
  readonly #family = "stmt" as const;
  readonly #for: VarDeclList;
  readonly #cond: Expr;
  readonly #each: Expr;
  readonly #then: Stmt;

  constructor(forDecl: VarDeclList, cond: Expr, each: Expr, then: Stmt) {
    this.#for = forDecl;
    this.#cond = cond;
    this.#each = each;
    this.#then = then;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get for() { return this.#for; }
  get cond() { return this.#cond; }
  get each() { return this.#each; }
  get then() { return this.#then; }

  toString() {
    return `for (${this.#for} ${this.#cond}; ${this.#each}) ${this.#then}`;
  }

  transform(t: Transformer) {
    return t.replace(
      this,
      () =>
        new ForLoopNode(
          this.#for.transform(t),
          this.#cond.transform(t),
          this.#each.transform(t),
          this.#then.transform(t),
        ),
    );
  }
}
