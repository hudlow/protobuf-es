import { Node } from "../node.js";
import type { Transformer } from "../transformer.js";
import { isObjectWith } from "../util.js";

const CODE_SEQUENCE_SYMBOL = Symbol("@bufbuild/typescript-composer/code/sequence");

export interface CodeSequence {
  [CODE_SEQUENCE_SYMBOL]: true;
  readonly kind: "codeSequence";
  readonly family: "code";
  readonly segments: CodeSegment[];
  toString(): string;
  transform(t: Transformer): CodeSequence;
  with(...input: CodeSequenceInput[]): CodeSequence;
}

type CodeSegment = Node | string;

export function isCodeSequence(v: unknown): v is CodeSequence {
  return isObjectWith(v, CODE_SEQUENCE_SYMBOL);
}

export function codeSequence(input: CodeSequenceInput): CodeSequence {
  if (isCodeSequence(input)) return input;

  return new CodeSequenceNode(
    [input]
      .flat(2)
      .flatMap(
        (p): CodeSegment | CodeSegment[] => {
          if (isCodeSequence(p)) return p.segments;
          return p;
        },
      ),
  );
}

export type CodeSequenceInput = SingularInput | ArrayInput;
type SingularInput = Node | string;
type ArrayInput = SingularInput[];

export function isCodeSequenceInput(input: unknown): input is CodeSequenceInput {
  return isCodeSequence(input) || typeof input === "string";
}

export class CodeSequenceNode implements CodeSequence {
  readonly [CODE_SEQUENCE_SYMBOL] = true as const;
  readonly #kind = "codeSequence" as const;
  readonly #family = "code" as const;
  readonly #segments: CodeSegment[];

  constructor(segments: CodeSegment[]) {
    this.#segments = segments;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get segments() { return this.#segments; }

  toString() {
    return this.#segments.join("");
  }

  transform(t: Transformer) {
    return t.replace(
      this,
      () =>
        new CodeSequenceNode(
          this.segments.map((p) => (typeof p === "string" ? p : p.transform(t))),
        ),
    );
  }

  with(...input: CodeSequenceInput[]) {
    const flatInput = input.flat();
    if (flatInput.every((i) => i === "")) return this;
    return codeSequence([...this.segments, ...flatInput]);
  }
}
