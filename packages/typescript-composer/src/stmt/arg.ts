import { expr, Expr, ExprInput, isExprInput } from "../expr/expr.js";
import { ident, Ident, IdentInput, isIdentInput } from "../expr/ident.js";
import { Node } from "../node.js";
import { isObjectWith } from "../util.js";
import type { Transformer } from "../transformer.js";
import { isTypeInput, type, TypeInput, type Type } from "../type/type.js";

const VAR_ARG_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/block");

export interface Arg {
  [VAR_ARG_SYMBOL]: true;
  readonly kind: "arg";
  readonly family: "stmt";
  readonly id: Ident;
  readonly type?: Type;
  readonly value?: Expr;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isArg(v: unknown): v is Arg {
  return isObjectWith(v, VAR_ARG_SYMBOL);
}

export function arg(id: IdentInput): Arg;
export function arg(id: IdentInput, value: ExprInput): Arg;
export function arg(id: IdentInput, type: TypeInput): Arg;
export function arg(id: IdentInput, type: TypeInput, value: ExprInput): Arg;
export function arg(...tuple: ArgInputTuple): Arg
export function arg(input: Arg | ArgInputTuple): Arg
export function arg(...t: [Arg | ArgInputTuple] | ArgInputTuple): Arg {
  if (isArg(t[0])) return t[0];
  if (isArgInputTuple(t[0])) {
    return arg(...t[0]);
  }

  if (isIdentTuple(t)) return new ArgNode(ident(t[0]));
  if (isIdentTypeTuple(t)) return new ArgNode(ident(t[0]), type(t[1]));
  if (isIdentValueTuple(t)) return new ArgNode(ident(t[0]), undefined, expr(t[1]));

  return new ArgNode(ident(t[0]), type(t[1]), expr(t[2]));
}

export type ArgInput = Arg | ArgInputTuple;

type ArgInputTuple =
  | IdTupleArgInput
  | IdValueTupleArgInput
  | IdTypeTupleArgInput
  | IdTypeValueTupleArgInput;

type IdTupleArgInput =
  | readonly [IdentInput]
  | readonly[IdentInput, undefined]
  | readonly [IdentInput, undefined, undefined];
type IdValueTupleArgInput = readonly [IdentInput, ExprInput];
type IdTypeTupleArgInput = readonly [IdentInput, Type];
type IdTypeValueTupleArgInput = readonly [IdentInput, TypeInput, ExprInput];

export function isArgInput(v: unknown): boolean {
  return (isArg(v) || isArgInputTuple(v));
}
function isArgInputTuple(v: unknown): v is ArgInputTuple {
  return (
    Array.isArray(v) && (
      isIdentTuple(v) ||
      isIdentTypeTuple(v) ||
      isIdentValueTuple(v) ||
      isIdentTypeValueTuple(v)
    )
  );
}

function isIdentTuple(t: readonly unknown[]): t is IdTupleArgInput {
  return (t.length === 1 && isIdentInput(t[0]))
}

function isIdentTypeTuple(t: readonly unknown[]): t is IdTypeTupleArgInput {
  return (t.length === 2 && isIdentInput(t[0]) && isTypeInput(t[1]));
}

function isIdentValueTuple(t: readonly unknown[]): t is IdValueTupleArgInput {
  return (t.length === 2 && isIdentInput(t[0]) && isExprInput(t[1]));
}

function isIdentTypeValueTuple(t: readonly unknown[]): t is IdValueTupleArgInput {
  return (t.length === 3 && isIdentInput(t[0]) && isTypeInput(t[1]) && isExprInput(t[2]));
}

class ArgNode implements Arg {
  readonly [VAR_ARG_SYMBOL]: true = true;
  readonly #kind = "arg" as const;
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

  transform(t: Transformer) {
    return t.replace(
      this,
      () =>
        new ArgNode(
          this.id.transform(t),
          this.type ? this.type.transform(t) : undefined,
          this.value ? this.value.transform(t) : undefined,
        ),
    );
  }
}
