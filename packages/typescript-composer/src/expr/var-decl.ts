import { expr, Expr, ExprInput, exprProxy, isExprInput } from "../expr/expr.js";
import { ident, Ident, IdentInput, isIdentInput } from "../expr/ident.js";
import { isObjectWith } from "../util.js";
import type { Transformer } from "../transformer.js";
import { isTypeInput, type, TypeInput, type Type } from "../type/type.js";

const VAR_DECL_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/block");

export interface VarDecl {
  [VAR_DECL_SYMBOL]: true;
  readonly kind: "varDecl";
  readonly family: "stmt";
  readonly id: Ident;
  readonly type?: Type;
  readonly value?: Expr;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isVarDecl(v: unknown): v is VarDecl {
  return isObjectWith(v, VAR_DECL_SYMBOL);
}

export function varDecl(id: IdentInput): VarDecl;
export function varDecl(id: IdentInput, value: ExprInput): VarDecl;
export function varDecl(id: IdentInput, type: TypeInput): VarDecl;
export function varDecl(id: IdentInput, type: TypeInput, value: ExprInput): VarDecl;
export function varDecl(...tuple: VarDeclInputTuple): VarDecl
export function varDecl(input: Ident | VarDeclInputTuple | VarDecl): VarDecl
export function varDecl(...t: [VarDeclInputTuple | VarDecl] | VarDeclInputTuple): VarDecl {
  if (isVarDecl(t[0])) return t[0];
  if (isVarDeclInputTuple(t[0])) {
    return varDecl(...t[0]);
  }

  if (isIdentTuple(t)) return new VarDeclNode(ident(t[0]));
  if (isIdentTypeTuple(t)) return new VarDeclNode(ident(t[0]), type(t[1]));
  if (isIdentValueTuple(t)) return new VarDeclNode(ident(t[0]), undefined, expr(t[1]));

  return new VarDeclNode(ident(t[0]), type(t[1]), expr(t[2]));
}

export type VarDeclInput = VarDecl | VarDeclInputTuple;

type VarDeclInputTuple =
  | IdTupleVarDeclInput
  | IdValueTupleVarDeclInput
  | IdTypeTupleVarDeclInput
  | IdTypeValueTupleVarDeclInput;

type IdTupleVarDeclInput =
  | readonly [IdentInput]
  | readonly[IdentInput, undefined]
  | readonly [IdentInput, undefined, undefined];
type IdValueTupleVarDeclInput = readonly [IdentInput, ExprInput];
type IdTypeTupleVarDeclInput = readonly [IdentInput, Type];
type IdTypeValueTupleVarDeclInput = readonly [IdentInput, TypeInput, ExprInput];

export function isVarDeclInput(v: unknown): boolean {
  return (isVarDecl(v) || isVarDeclInputTuple(v));
}
function isVarDeclInputTuple(v: unknown): v is VarDeclInputTuple {
  return (
    Array.isArray(v) && (
      isIdentTuple(v) ||
      isIdentTypeTuple(v) ||
      isIdentValueTuple(v) ||
      isIdentTypeValueTuple(v)
    )
  );
}

function isIdentTuple(t: readonly unknown[]): t is IdTupleVarDeclInput {
  return (t.length === 1 && isIdentInput(t[0]))
}

function isIdentTypeTuple(t: readonly unknown[]): t is IdTypeTupleVarDeclInput {
  return (t.length === 2 && isIdentInput(t[0]) && isTypeInput(t[1]));
}

function isIdentValueTuple(t: readonly unknown[]): t is IdValueTupleVarDeclInput {
  return (t.length === 2 && isIdentInput(t[0]) && isExprInput(t[1]));
}

function isIdentTypeValueTuple(t: readonly unknown[]): t is IdValueTupleVarDeclInput {
  return (t.length === 3 && isIdentInput(t[0]) && isTypeInput(t[1]) && isExprInput(t[2]));
}

class VarDeclNode implements VarDecl {
  readonly [VAR_DECL_SYMBOL]: true = true;
  readonly #kind = "varDecl" as const;
  readonly #family = "stmt" as const;
  readonly #id: Ident;
  readonly #type?: Type;
  readonly #value?: Expr;

  constructor(
    id: Ident,
    type?: Type,
    value?: Expr,
  ) {
    this.#id = id;
    this.#type = type;
    this.#value = value;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get id() { return this.#id; }
  get type() { return this.#type; }
  get value() { return this.#value; }

  toString() {
    let declaration = this.id.toString();

    if (this.type) declaration += `: ${this.type}`;
    if (this.value) declaration += ` = ${this.value}`;

    return declaration;
  }

  transform(t: Transformer): VarDecl {
    return exprProxy(
      t.replace(
        this,
        () =>
          new VarDeclNode(
            this.#id.transform(t),
            this.#type?.transform(t),
            this.#value?.transform(t),
          ),
      ),
    );
  }
}
