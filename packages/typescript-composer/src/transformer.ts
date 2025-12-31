import { Node } from "./node";

export abstract class Transformer {
  abstract mutate(original: Node): Node;

  readonly #registry: Entry<Node>[] = [];
  #register<N extends Node>(original: N, replacement: N): N {
    this.#registry.push({ original, replacement });
    return replacement;
  }

  replace<N extends Node>(original: N, replacer: () => N): N;
  replace(original: Node, replacer: () => Node): Node {
    const found = this.#registry.find((n) => n.original === original);
    if (found) return found.replacement;

    return this.#register(original, this.mutate(replacer()));
  }
}

type Entry<T extends Node> = {
  original: T;
  replacement: T;
};
