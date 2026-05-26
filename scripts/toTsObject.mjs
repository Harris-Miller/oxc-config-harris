/** @param {unknown} obj @param {number} [indent] */
export function toTsObject(obj, indent = 0) {
  const pad = "  ".repeat(indent);
  const padIn = "  ".repeat(indent + 1);
  if (obj === null) return "null";
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj.map((v) => `${padIn}${toTsObject(v, indent + 1)}`).join(",\n");
    return `[\n${items},\n${pad}]`;
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";
    const items = entries
      .map(([k, v]) => {
        const key =
          /^[a-zA-Z_$][\w$]*$/.test(k) && !k.includes("-") && !k.includes("/")
            ? k
            : JSON.stringify(k);
        return `${padIn}${key}: ${toTsObject(v, indent + 1)}`;
      })
      .join(",\n");
    return `{\n${items},\n${pad}}`;
  }
  return JSON.stringify(obj);
}
