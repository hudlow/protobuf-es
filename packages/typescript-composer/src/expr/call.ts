import { Node } from "../node.js";
import { isObjectWith } from "../util.js";
import type { Transformer } from "../transformer.js";
import {
  type Expr,
  type ExprInput,
  expr,
  exprProxy,
  isExprInput,
} from "./expr.js";

const CALL_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/call");

export interface Call {
  [CALL_SYMBOL]: true;
  readonly kind: "call";
  readonly family: "expr";
  readonly target: Expr;
  readonly args: Expr[];
  toString(): string;
  transform(t: Transformer): Node;
}

export function isCall(v: unknown): v is Call {
  return isObjectWith(v, CALL_SYMBOL);
}

export function call(target: ExprInput, ...args: ExprInput[]): Call {
  return exprProxy(new CallNode(expr(target), args.map(expr)));
}

export type CallInput = [ExprInput, ...ExprInput[]];
export function isCallInput(input: unknown): input is CallInput {
  return (Array.isArray(input) && input.length > 0 && input.every(isExprInput));
}

class CallNode implements Call {
  [CALL_SYMBOL] = true as const;
  readonly #family = "expr" as const;
  readonly #kind = "call" as const;
  readonly #target: Expr;
  readonly #args: Expr[];

  constructor(
    target: Expr,
    args: Expr[],
  ) {
    this.#target = target;
    this.#args = args;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get target() { return this.#target; }
  get args() { return this.#args; }

  toString(): string {
    return `${this.#target}(${this.#args.join(", ")})`;
  }

  transform(_: Transformer): Call {
    return exprProxy(this);
  }
}
