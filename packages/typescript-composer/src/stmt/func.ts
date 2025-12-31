import { type Ident, ident } from "../expr/ident.js";
import type { IdentInput } from "../expr/ident.js";
import { type Ref, ref } from "../expr/ref.js";
import { Node } from "../node.js";
import {
  isObjectWith,
  type Transformer,
} from "../plumbing.js";
import { type Type, type } from "../type/type.js";
import { type Arg, type ArgInput, arg } from "./arg.js";
import {
  type Block,
  block,
} from "./block.js";

const VAR_FUNC_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/func");

export interface Func {
  [VAR_FUNC_SYMBOL]: true;
  readonly kind: "func";
  readonly family: "stmt";
  readonly id: Ident;
  readonly args: Arg[];
  readonly body: Block;
  readonly returnType?: Type;
  toString(): string;
  transform(t: Transformer): Node;
}

export function isFunc(v: unknown): v is Func {
  return isObjectWith(v, VAR_FUNC_SYMBOL);
}

export function func<const I extends readonly ArgInput[]>(
  name: IdentInput,
  args: I,
  body: BodyFunc<I> | Block,
  returnType?: Type,
): Func;
export function func<const I extends readonly ArgInput[]>(func: FuncObjectInput<I>): Func;
export function func<const I extends readonly ArgInput[]>(
  ...i: FuncInput<I> | [FuncObjectInput<I>]
): Func {
  const [name, args, body, returnType] =
    i.length === 1 ? [i[0].id, i[0].args, i[0].body, i[0].returnType] : i;

  const argInstances = args.map(arg);

  const argRefs = argInstances.map(ref);
  const bodyResult = typeof body === "function" ? body(...argRefs) : body;

  return new FuncNode(
    ident(name),
    argInstances,
    block(...(Array.isArray(bodyResult) ? bodyResult : [bodyResult])),
    returnType ? type(returnType) : undefined,
  );
}

export type FuncInput<I extends readonly ArgInput[]> = readonly [
  IdentInput,
  I,
  BodyFunc<I> | Block,
  Type?,
];

interface FuncObjectInput<I extends readonly ArgInput[]> {
  id: IdentInput;
  args: I;
  body: BodyFunc<I> | Block;
  returnType?: Type;
}

type BodyFunc<I extends readonly ArgInput[]> = (
  ...args: ArgRefTuple<I> & readonly Ref<Arg>[]
) => Block;

export class FuncNode implements Func {
  [VAR_FUNC_SYMBOL] = true as const;
  readonly #kind = "func" as const;
  readonly #family = "stmt" as const;
  readonly #id: Ident;
  readonly #args: Arg[];
  readonly #body: Block;
  readonly #returnType?: Type;

  constructor(
    id: Ident,
    args: Arg[],
    body: Block,
    returnType?: Type,
  ) {
    this.#id = id;
    this.#args = args;
    this.#body = body;
    this.#returnType = returnType;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get id() { return this.#id; }
  get args() { return this.#args; }
  get body() { return this.#body; }
  get returnType() { return this.#returnType; }

  toString() {
    const returnTypeAnnotation = this.returnType ? `: ${this.returnType}` : "";
    return `function ${this.id}(${this.args.join(", ")})${returnTypeAnnotation} ${this.body}`;
  }

  transform(t: Transformer) {
    return t.replace(
      this,
      () =>
        new FuncNode(
          this.id.transform(t),
          this.args.map((a) => a.transform(t)),
          this.body.transform(t),
          this.returnType ? this.returnType.transform(t) : undefined,
        ),
    );
  }
}

export type ArgRefTuple<I extends readonly ArgInput[]> = I extends readonly [
  ArgInput,
  ...infer Rest extends ArgInput[],
]
  ? [Ref<Arg>, ...ArgRefTuple<Rest>]
  : [];

// export type Func = FuncNode;
// export const Func = provider(FuncNode);
// export const { func, isFunc, isFuncInput } = Func;
