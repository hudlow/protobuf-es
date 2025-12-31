import { isExpr, type Expr, type ExprInput } from "./expr/expr.js";
import { type Arg, isStmt, type Stmt, type StmtInput } from "./stmt/stmt.js";
import { isType, type Type } from "./type/type.js";
import { isCode, type Code } from "./code/code.js";
import { CodeSequence } from "./code/sequence.js";

export type Node = Expr | Stmt | Arg | Type | Code | CodeSequence;
export type NodeInput = ExprInput | StmtInput;

export function isNode(input: unknown): input is Node {
  return isExpr(input) || isStmt(input) || isType(input) || isCode(input);
}

// export function compose(input: NodeInput) {
  // if (isExprInput(input)) return expr(input);
  // return stmt(input);
// }
