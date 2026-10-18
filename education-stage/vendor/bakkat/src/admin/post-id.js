const validPostSlug = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

export function isValidPostSlug(value) {
  return typeof value === "string" && validPostSlug.test(value);
}
