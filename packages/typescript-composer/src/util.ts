export function isObjectWith<T, const P extends keyof any>(v: T, p: P): v is T & { [K in P]: unknown } {
  return (isObject(v) && p in v);
}

export function isObject<T>(v: T): v is T & Record<keyof any, unknown> {
  return (typeof v === "object" && v !== null);
}

export function isTemplateStringsArray(
  input: unknown,
): input is TemplateStringsArray {
  return (
    Array.isArray(input) &&
    Array.isArray((input as { raw?: unknown })?.raw) &&
    input.every((s) => typeof s === "string")
  );
}

export function indent(code: string) {
  return code
    .split("\n")
    .map((l) => (l == "" ? "" : `  ${l}`))
    .join("\n");
}
