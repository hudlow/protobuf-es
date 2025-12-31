import { type Code, isCode } from "../code/code.js";
import { isInline } from "../expr/inline.js";
import { Node } from "../node.js";
import { Transformer } from "../transformer.js";
import {
  indent,
  isObjectWith,
} from "../util.js";
import { exprStmt } from "./expr-stmt.js";
import { type Stmt, type StmtInput, isStmtInput, stmt } from "./stmt.js";

const VAR_BLOCK_SYMBOL = Symbol("@bufbuild/typescript-composer/stmt/block");

export interface Block {
  [VAR_BLOCK_SYMBOL]: true;
  readonly kind: "block";
  readonly family: "stmt";
  readonly block: (Stmt | Code)[];
  toString(): string;
  transform(t: Transformer): Node;
}

export function isBlock(v: unknown): v is Block {
  return isObjectWith(v, VAR_BLOCK_SYMBOL);
}

export function block(block: Block): Block;
export function block(block: BlockObject): Block;
export function block(block: () => BlockInput): Block;
export function block(input: StmtInput[]): Block;
export function block(...input: StmtInput[]): Block;
export function block(
  input?: StmtInput,
  ...additionalInput: StmtInput[]
): Block {
  if (additionalInput.length === 0) {
    if (input === undefined) return new BlockNode([]);
    if (isBlock(input)) return input;
    if (isBlockObject(input)) return block(...input.block);
    if (Array.isArray(input)) return block(...input);
    if (typeof input === "function") {
      const result = input();
      return block(...(Array.isArray(result) ? result : [result]));
    }
  }

  return new BlockNode(
    [input, ...additionalInput].map((s) => (isCode(s) ? s : stmt(s))),
  );
}

export type BlockObject = { block: StmtInput[] };
export type BlockInput = Block | BlockObject | StmtInput[];

export function isBlockInput(v: unknown): v is BlockInput {
  return (
    isBlock(v) ||
    isBlockObject(v) ||
    (Array.isArray(v) && v.every((s) => isStmtInput(s)))
  );
}

function isBlockObject(input: unknown): input is BlockObject {
  return (
    isObjectWith(input, "block") &&
    Array.isArray(input.block) &&
    input.block.every((s) => isStmtInput(s))
  );
}

class BlockNode implements Block {
  readonly [VAR_BLOCK_SYMBOL] = true as const;
  static readonly kind = "block";
  readonly #kind = "block" as const;
  readonly #family = "stmt" as const;
  readonly #block: (Stmt | Code)[];

  constructor(block: (Stmt | Code)[]) {
    this.#block = block;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get block() { return this.#block; }

  toString() {
    return `{\n${indent(this.block.join("\n"))}\n}`;
  }

  transform(t: Transformer): Block {
    return t.replace(
      this,
      () => new BlockNode(this.block.map((p) => p.transform(t))),
    );
  }
}

// When we probably want a block...except when we don't.
export function blockish(node: BlockInput) {
  if (isBlock(node)) return node;
  if (isInline(node)) return exprStmt(node);
  return block(...(Array.isArray(node) ? node : [node]));
}
