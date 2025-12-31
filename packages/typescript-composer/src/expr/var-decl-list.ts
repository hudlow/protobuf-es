import { exprProxy, isVarDeclInput, varDecl, VarDecl, VarDeclInput } from "../expr/expr.js";
import { IdentInput } from "../expr/ident.js";
import { Node } from "../node.js";
import { isObjectWith } from "../util.js";
import type { Transformer } from "../transformer.js";

const VAR_DECL_LIST_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/var-decl-list");

export interface VarDeclList {
  [VAR_DECL_LIST_SYMBOL]: true;
  readonly kind: "varDeclList";
  readonly family: "stmt";
  readonly declarations: VarDecl[];
  toString(): string;
  transform(t: Transformer): Node;
}

export function isVarDeclList(v: unknown): v is VarDeclList {
  return isObjectWith(v, VAR_DECL_LIST_SYMBOL);
}

export function varDeclList(
  decl: FlexibleVarDeclInput,
  ...additionalDecls: FlexibleVarDeclInput[]
): VarDeclList;
export function varDeclList(declList: VarDeclList): VarDeclList;
export function varDeclList(
  decl: FlexibleVarDeclInput | VarDeclList,
  ...additionalDecls: FlexibleVarDeclInput[]
): VarDeclList {
  if (isVarDeclList(decl)) return decl;

  return exprProxy(
    new VarDeclListNode(
      [decl, ...additionalDecls].map(varDecl),
    ),
  );
}

export type VarDeclListInput = [
  FlexibleVarDeclInput,
  ...FlexibleVarDeclInput[],
];
type FlexibleVarDeclInput = VarDeclInput | IdentInput | VarDecl;

export function isVarDeclListInput(input: unknown): input is VarDeclListInput {
  return (
    Array.isArray(input) &&
    input.length >= 1 &&
    input.every((v) => isVarDeclInput(v))
  );
}

class VarDeclListNode implements VarDeclList {
  readonly [VAR_DECL_LIST_SYMBOL]: true = true;
  readonly #kind = "varDeclList" as const;
  readonly #family = "stmt" as const;
  readonly #declarations: VarDecl[];

  constructor(declarations: VarDecl[]) {
    this.#declarations = declarations;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get declarations() { return this.#declarations; }

  toString() {
    return this.#declarations.join(", ");
  }

  transform(t: Transformer): VarDeclList {
    return exprProxy(
      t.replace(
        this,
        () => new VarDeclListNode(this.#declarations.map((d) => d.transform(t))),
      ),
    );
  }
}
