/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * Small enough to own. The alternative is a dependency in a package whose
 * entire job is to be installed by two apps that do not want a dependency tree.
 */

/** `#rgb` or `#rrggbb` → [r, g, b] in 0–255. Anything else returns null. */
export function rgb(colour) {
  const hex = String(colour).trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(hex);
  if (short) return short.slice(1).map((c) => parseInt(c + c, 16));
  const long = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (long) return long.slice(1).map((c) => parseInt(c, 16));
  return null; // rgba() and friends: not comparable without a known backdrop
}

export function luminance(colour) {
  const parts = rgb(colour);
  if (!parts) return null;
  const [r, g, b] = parts.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio, 1–21. Null when either colour is not a plain hex. */
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}
