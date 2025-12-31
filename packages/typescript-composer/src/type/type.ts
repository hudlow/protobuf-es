import { Transformer } from "../transformer.js";
import { isObjectWith } from "../util.js";
import { Ident, ident, IdentInput, isIdentInput } from "../expr/ident.js";

const TYPE_SYMBOL = Symbol("@bufbuild/typescript-composer/type");

export interface Type {
  [TYPE_SYMBOL]: true;
  readonly kind: "type";
  readonly family: "expr";
  readonly id: Ident;
  toString(): string;
  transform(t: Transformer): Type;
}

export function isType(v: unknown): v is Type {
  return isObjectWith(v, TYPE_SYMBOL);
}

export function type(input: TypeInput): Type {
    if (isType(input)) return input;
    if (isObjectInput(input)) return type(input.type);
    if (isIdentInput(input)) return new TypeNode(ident(input));
    return new TypeNode(input);
  }

export type TypeInput = TypeNode | ObjectTypeInput | IdentInput;
type ObjectTypeInput = { type: string | IdentInput; };

export function isTypeInput(input: unknown): input is TypeInput {
  return (
    isType(input) ||
    isObjectInput(input) ||
    isIdentInput(input) ||
    typeof input === "string"
  );
}

function isObjectInput(input: unknown): input is ObjectTypeInput {
  return isObjectWith(input, "type") && isIdentInput(input.type);
}

class TypeNode implements Type {
  readonly [TYPE_SYMBOL] = true as const
  readonly #kind = "type" as const;
  readonly #family = "expr" as const;
  readonly #id: Ident;

  constructor(id: Ident) {
    this.#id = id;
  }

  get kind() { return this.#kind; }
  get family() { return this.#family; }
  get id() { return this.#id; }

  toString() {
    return this.id.toString();
  }

  transform(_: Transformer) {
    return this;
  }
}
