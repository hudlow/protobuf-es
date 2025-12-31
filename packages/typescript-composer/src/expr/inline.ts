import { isObjectWith, isTemplateStringsArray } from "../util.js";
import type { Transformer } from "../transformer.js";
import { Type } from "../type/type.js";
import { expr, Expr, ExprInput, exprProxy, isExpr } from "./expr.js";

const INLINE_SYMBOL = Symbol("@bufbuild/typescript-composer/expr/inline");

export interface Inline {
  [INLINE_SYMBOL]: true;
  readonly kind: "inline";
  readonly family: "expr";
  readonly inline: (string | Expr | Type)[];
  toString(): string;
  transform(t: Transformer): Expr;
  with(...input: InlineInput): Inline;
}

export function isInline(v: unknown): v is Inline {
  return isObjectWith(v, INLINE_SYMBOL);
}

export function inline(...input: InlineInput): Inline;
export function inline(
  segments: TemplateStringsArray,
  ...params: (string | ExprInput)[]
): Inline;
export function inline(
  ...uncertainInput:
    | InlineInput
    | [TemplateStringsArray, ...(string | ExprInput)[]]
): Inline {
  if (uncertainInput.length === 1) {
    if (isInline(uncertainInput[0])) return uncertainInput[0];
  }

  if (isTemplateStringsArray(uncertainInput[0])) {
    return tag(
      uncertainInput[0],
      ...(uncertainInput.slice(1) as (string | ExprInput)[]),
    );
  }

  const input = uncertainInput as InlineInput;

  const constructorInput = input.flatMap((p) => {
    if (isInline(p)) return p.inline;
    if (isObjectInput(p))
      return inline(...p.inline).inline;
    return p;
  });

  return exprProxy(new InlineNode(constructorInput.filter((i) => i !== "")));
}

function tag(
    segments: TemplateStringsArray,
    ...params: (string | ExprInput)[]
  ): Inline {
  // Forbid a new line beginning, which clearly differentiates this from line set templates.
  if (segments[0].startsWith("\n")) {
    throw new Error(
      "An inline template literal must not start with a new line.",
    );
  }

  let parts: (string | Expr)[] = [];
  for (let i = 0; i < segments.length; ++i) {
    parts.push(segments[i]);

    // The length of segments is always (params.length + 1),
    // so for the last iteration, we won't have a parameter to add.
    if (i < params.length) {
      const param = params[i];
      parts.push(typeof param === "string" ? param : expr(param));
    }
  }

  return inline(parts[0], ...parts.slice(1));
}

type AtomicInlineInput = string | Expr | Type | { inline: AtomicInlineInput[] };
export type InlineInput = AtomicInlineInput[];

export function isInlineInput(input: unknown): input is InlineInput {
  return (
    isExpr(input) ||
    isObjectInput(input) ||
    typeof input === "string"
  );
}

function isObjectInput(
  input: unknown,
): input is { inline: AtomicInlineInput[] } {
  return (
    isObjectWith(input, "inline") && isInlineInput(input.inline)
  );
}

export class InlineNode implements Inline
{
  [INLINE_SYMBOL] = true as const;
  readonly #family = "expr" as const;
  readonly #kind = "inline" as const;
  readonly #inline: (string | Expr | Type)[];

  constructor(inline: (string | Expr | Type)[]) {
    this.#inline = inline;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get inline() { return this.#inline; }

  toString() {
    return this.#inline.join("");
  }

  transform(_: Transformer) {
    return exprProxy(this);
  }

  with(...input: InlineInput): Inline {
    if (input.every((i) => i === "")) return exprProxy(this);
    return inline(...this.#inline, ...input);
  }
}
