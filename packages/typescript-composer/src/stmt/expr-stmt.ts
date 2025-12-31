import { type Expr, type ExprInput, expr, isExprInput } from "../expr/expr.js";
import { Node } from "../node.js";
import {
    isObjectWith,
  type Transformer,
} from "../plumbing.js";

const VAR_EXPR_STMT_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/expr-stmt");

export interface ExprStmt {
  [VAR_EXPR_STMT_SYMBOL]: true;
  readonly kind: "exprStmt";
  readonly family: "stmt";
  readonly expr: Expr;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isExprStmt(v: unknown): v is ExprStmt {
  return isObjectWith(v, VAR_EXPR_STMT_SYMBOL);
}

export function exprStmt(input: ExprStmtInput): ExprStmt {
  if (isExprStmt(input)) return input;

  return new ExprStmtNode(expr(input));
}

export type ExprStmtInput = ExprStmt | ExprInput;

export function isExprStmtInput(v: unknown): v is ExprStmtInput {
  return (isExprStmt(v) || isExprInput(v));
}

class ExprStmtNode implements ExprStmt {
  readonly [VAR_EXPR_STMT_SYMBOL] = true as const;
  readonly #kind = "exprStmt" as const;
  readonly #family = "stmt" as const;
  readonly #expr: Expr;

  constructor(expr: Expr) {
    this.#expr = expr;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get expr() { return this.#expr; }

  toString() {
    return `${this.expr};`;
  }

  transform(t: Transformer) {
    return t.replace(this, () => new ExprStmtNode(this.expr.transform(t)));
  }
}
