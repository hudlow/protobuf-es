import { isObjectWith } from "../util.js";
import type { Transformer } from "../transformer.js";
import { Arg, Func, isArg, isFunc } from "../stmt/stmt.js";
import { Expr, exprProxy } from "./expr.js";
import { Ident } from "./ident.js";

const REF_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/ref");

export interface Ref<T extends Referenceable = Referenceable> {
  [REF_SYMBOL]: true;
  readonly kind: "ref";
  readonly family: "expr";
  readonly id: Ident;
  readonly ref: T;
  toString(): string;
  transform(t: Transformer): Expr;
}

export function isRef(v: unknown): v is Ref {
  return isObjectWith(v, REF_SYMBOL);
}

export function ref<T extends Referenceable>(input: RefInput<T>): Ref<T> {
  if (isRef(input)) return input;
  if (isObjectInput(input)) return ref(input.ref);


  return exprProxy(new RefNode(input));
}

export type RefInput<T extends Referenceable = Referenceable> = T | ObjectRefInput<T> | Ref<T>;
export function isRefInput(
  input: unknown,
): input is RefInput {
  return (
    isRef(input) || isReferenceable(input) || isObjectInput(input)
  );
}

export type Referenceable = Arg | Func;
function isReferenceable(
  v: unknown,
): v is Referenceable {
  return (isArg(v) || isFunc(v));
}

type ObjectRefInput<T extends Referenceable = Referenceable> = { ref: T };
function isObjectInput(
  input: unknown,
): input is ObjectRefInput {
  return isObjectWith(input, "ref") && isRefInput(input.ref);
}

export class RefNode<T extends Referenceable> implements Ref<T>
{
  [REF_SYMBOL] = true as const;
  readonly #family = "expr" as const;
  readonly #kind = "ref" as const;
  readonly #ref: T;

  constructor(ref: T) {
    this.#ref = ref;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get id() { return this.#ref.id; }
  get ref() { return this.#ref; }

  toString() {
    return this.#ref.id.toString();
  }

  transform(_: Transformer): Expr {
    return exprProxy(this);
  }
}
