import {
  type VarDeclList,
  isVarDeclList,
  isVarDeclListInput,
} from "../expr/var-decl-list.js";
import { type VarDeclListInput, varDeclList } from "../expr/var-decl-list.js";
import { Node } from "../node.js";
import { isObjectWith } from "../plumbing.js";
import type { Transformer } from "../plumbing.js";

const VAR_DECL_STMT_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/var-decl-stmt");

export interface VarDeclStmt {
  [VAR_DECL_STMT_SYMBOL]: true;
  readonly kind: "varDeclStmt";
  readonly family: "stmt";
  readonly keyword: "const" | "let";
  readonly list: VarDeclList;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isVarDeclStmt(v: unknown): v is VarDeclStmt {
  return isObjectWith(v, VAR_DECL_STMT_SYMBOL);
}

export function varDeclStmt(input: VarDeclStmtInput): VarDeclStmt {
  if (isConstInput(input)) return new VarDeclStmtNode("const", varDeclList(input.const));
  if (isLetInput(input)) return new VarDeclStmtNode("let", varDeclList(input.let));

  return input;
}

type ConstInput = { const: VarDeclListInput; };
type LetInput = { let: VarDeclListInput; };

export type VarDeclStmtInput = ConstInput | LetInput | VarDeclStmt;

export function isVarDeclStmtInput(v: unknown): v is VarDeclStmtInput {
  return (isVarDeclList(v) || isConstInput(v) || isLetInput(v));
}

function isConstInput(v: unknown): v is ConstInput {
  return isObjectWith(v, "const") && isVarDeclListInput(v.const);
}

function isLetInput(v: unknown): v is LetInput {
  return isObjectWith(v, "let") && isVarDeclListInput(v.let);
}

class VarDeclStmtNode implements VarDeclStmt {
  readonly [VAR_DECL_STMT_SYMBOL]: true = true;
  readonly #kind = "varDeclStmt" as const;
  readonly #family = "stmt" as const;
  readonly #keyword: "const" | "let";
  readonly #list: VarDeclList;

  constructor(keyword: "const" | "let", list: VarDeclList) {
    this.#keyword = keyword;
    this.#list = list;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get keyword() { return this.#keyword; }
  get list() { return this.#list; }

  toString() {
    return `${this.#keyword} ${this.#list};`;
  }

  transform(t: Transformer) {
    return t.replace(
      this,
      () => new VarDeclStmtNode(this.#keyword, this.#list.transform(t)),
    );
  }
}
