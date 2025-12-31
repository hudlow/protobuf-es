import { isNode, Node } from "../node.js";
import {
  isObjectWith,
} from "../util.js";
import { type Access, access } from "./access.js";
import { type Binary, binary } from "./binary.js";
import { type Call, call } from "./call.js";
import { Ident } from "./ident.js";
import { Inline } from "./inline.js";
import {
  type Literal,
  type RawLiteralInput,
  isLiteralInput,
  literal,
} from "./literal/literal.js";
import { Parens } from "./parens.js";
import { isRefInput, Ref, ref } from "./ref.js";
import { VarDeclList } from "./var-decl-list.js";
import { VarDecl } from "./var-decl.js";

export type Expr = Access | Binary | Call | Ident | Inline | Literal | Parens | Ref | VarDeclList | VarDecl;

function capitalize<S extends string>(s: S): Capitalize<S> {
  return (s.slice(0, 1).toUpperCase() + s.slice(1)) as Capitalize<S>;
}

const isExprProxyKey = Symbol("isExprProxyKey");
function isExprProxy<N extends Node>(node: N): node is ExprNode<N> {
  return (
    (node as unknown as { [isExprProxyKey]: true | undefined })[
      isExprProxyKey
    ] === true
  );
}

const BINARY_EXPR_MAP = {
  isEqualTo: "==",
  isStrictlyEqualTo: "===",
  isNotEqualTo: "!=",
  isNotStrictlyEqualTo: "!==",
  isGreaterThan: ">",
  isAtLeast: ">=",
  isLessThan: "<",
  isAtMost: "<=",
  plus: "+",
  minus: "-",
  add: "+=",
  subtract: "-=",
  assign: "=",
} as const;

export function exprProxy<N extends Expr>(base: N) {
  if (isExprProxy(base)) return base;
  return new Proxy(base, {
    get(target: N, name, receiver: N & ExprNode<N>) {
      if (typeof name === "string") {
        if (name.startsWith("$") || name === "get") {
          const r = isRefInput(receiver) ? ref(receiver) : receiver;
          if (name === "$" || name === "get") return exprAccessProxy(r);
          return access(r, name.slice(1));
        }
        if (name.startsWith("_") || name === "call") {
          const r = isRefInput(receiver) ? ref(receiver) : receiver;
          if (name === "_" || name === "call") return exprCallingProxy(r);
          return exprCallingProxy(access(r, name.slice(1)));
        }
        if (name in BINARY_EXPR_MAP) {
          const r = isRefInput(receiver) ? ref(receiver) : receiver;
          return exprBinaryProxy(
            r,
            BINARY_EXPR_MAP[name],
          );
        }
      }

      if (typeof name === "symbol" && name === isExprProxyKey) {
        return true;
      }

      return Reflect.get(target, name, receiver);
    },
  }) as ExprNode<N>;
}

type Caller = (...args: ExprInput[]) => Call;
type Accessor = (index: ExprInput) => Access;
type Binator = (index: ExprInput) => Binary;

function exprCallingProxy(base: Expr): Caller {
  return (...args: ExprInput[]) => call(base, ...args);
}

function exprAccessProxy(base: Expr): Accessor {
  return (index: ExprInput) => access(base, index) as Access;
}

function exprBinaryProxy(
  base: Expr,
  operator: (typeof BINARY_EXPR_MAP)[keyof typeof BINARY_EXPR_MAP],
): Binator {
  return (left: ExprInput) => binary(base, operator, left);
}

export type ExprNode<N> = N &
  UnknownExpr & {
    [Key in `$${string}`]: Access;
  } & {
    $: (index: ExprInput) => Access;
    get: (index: ExprInput) => Access;
    call: (...args: ExprInput[]) => Call;
  } & {
    [Key in `_${string}`]: (
      ...args: ExprInput[]
    ) => Call;
  } & {
    [Key in keyof typeof BINARY_EXPR_MAP]: (
      right: ExprInput,
    ) => Binary;
  };

export function exprProvider<
  P extends ExprNodeImplementation<Node, unknown>,
>(nodeClass: P) {
  return {
    [nodeClass.kind]: nodeClass.marshal,
    [`is${capitalize(nodeClass.kind)}`]: nodeClass.is,
    [`is${capitalize(nodeClass.kind)}Input`]: nodeClass.isInput,
  } as ExprProvider<P>;
}

export type ExprProvider<
  P extends ExprNodeImplementation<Node, unknown>,
> = {
  [A in P["kind"]]: P["marshal"];
} & {
  [B in `is${Capitalize<P["kind"]>}`]: P["is"];
} & {
  [C in `is${Capitalize<P["kind"]>}Input`]: P["isInput"];
};

export type ExprNodeImplementation<
  N extends Node,
  I extends unknown,
> = {
  readonly kind: N["kind"];
  marshal(...input: I extends [...unknown[]] ? I : [I]): ExprNode<N>;
  is(input: unknown): input is ExprNode<N>;
  isInput(input: unknown): input is I;
};

type GenericExpr = { family: "expr" };
type UnknownExpr = GenericExpr & {
  [K in `$${string}`]: UnknownExpr;
};
export type ExprInput = Expr | RawLiteralInput;

export function expr<E extends UnknownExpr>(input: E): E;
export function expr(input: RawLiteralInput): Literal;
export function expr(input: ExprInput): Expr;
export function expr(input: ExprInput): Expr {
  if (isRefInput(input)) return ref(input);
  if (isExpr(input)) return input;
  return literal(input);
}

function isGenericExpr(input: unknown): input is GenericExpr {
  return isNode(input) && input.family === "expr";
}

export function isExpr<E extends UnknownExpr>(input: E): input is E;
export function isExpr(input: unknown): input is Expr;
export function isExpr(input: unknown): input is Expr {
  return isGenericExpr(input) && isObjectWith(input, isExprProxyKey);
}

export function isExprInput(input: unknown): input is ExprInput {
  return isRefInput(input) || isExpr(input) || isLiteralInput(input);
}

export * from "./access.js";
export * from "./binary.js";
export * from "./call.js";
export * from "./ident.js";
export * from "./inline.js";
export * from "./literal/literal.js";
export * from "./parens.js";
export * from "./ref.js";
export * from "./var-decl.js";
export * from "./var-decl-list.js";
