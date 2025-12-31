import { type Expr, isExpr } from "../expr/expr.js";
import { Block } from "./block.js";
import { ExprStmt, exprStmt } from "./expr-stmt.js";
import { type ForInInput, forIn, isForInInput, ForIn, isForIn } from "./for-in.js";
import { type ForLoopInput, forLoop, isForLoopInput, ForLoop, isForLoop } from "./for-loop.js";
import { type ForOfInput, forOf, isForOfInput, ForOf, isForOf } from "./for-of.js";
import { type IfThenInput, ifThen, isIfThenInput, IfThen, isIfThen } from "./if-then.js";
import { type RetInput, isRetInput, ret, Ret, isRet } from "./ret.js";
import {
  type VarDeclStmtInput,
  isVarDeclStmtInput,
  varDeclStmt,
  VarDeclStmt,
  isVarDeclStmt,
} from "./var-decl-stmt.js";
import {
  type WhileLoopInput,
  isWhileLoopInput,
  whileLoop,
  WhileLoop,
  isWhileLoop,
} from "./while-loop.js";

export type Stmt = Block | ExprStmt | ForIn | ForLoop | ForOf | IfThen | Ret | VarDeclStmt | WhileLoop;

export function isStmt(input: unknown): input is Stmt {
  return (
    isForIn(input) ||
    isForLoop(input) ||
    isForOf(input) ||
    isIfThen(input) ||
    isRet(input) ||
    isVarDeclStmt(input) ||
    isWhileLoop(input)
  );
}

export function stmt(input: StmtInput): Stmt {
  if (isStmt(input)) return input;
  if (isExpr(input)) return exprStmt(input);
  if (isForInInput(input)) return forIn(input);
  if (isForLoopInput(input)) return forLoop(input);
  if (isForOfInput(input)) return forOf(input);
  if (isIfThenInput(input)) return ifThen(input);
  if (isRetInput(input)) return ret(input);
  if (isVarDeclStmtInput(input)) return varDeclStmt(input);
  if (isWhileLoopInput(input)) return whileLoop(input);
  throw new Error("Invalid statement input.");
}

export type StmtInput =
  | Stmt
  | Expr
  | ForInInput
  | ForLoopInput
  | ForOfInput
  | IfThenInput
  | RetInput
  | VarDeclStmtInput
  | WhileLoopInput;

export function isStmtInput(input: unknown): input is StmtInput {
  return (
    isStmt(input) ||
    isExpr(input) ||
    isForInInput(input) ||
    isForLoopInput(input) ||
    isForOfInput(input) ||
    isIfThenInput(input) ||
    isRetInput(input) ||
    isVarDeclStmtInput(input) ||
    isWhileLoopInput(input)
  );
}

export * from "./arg.js";
export * from "./block.js";
export * from "./expr-stmt.js";
export * from "./for-in.js";
export * from "./for-of.js";
export * from "./for-loop.js";
export * from "./func.js";
export * from "./if-then.js";
export * from "./ret.js";
export * from "./var-decl-stmt.js";
export * from "./while-loop.js";
