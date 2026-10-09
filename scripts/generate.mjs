/**
 * tokens.json → tokens.css (web) and palette.js + palette.d.ts (app).
 *
 * Run `npm run build` and commit what comes out. The output is committed on
 * purpose: pnpm 10.26 stopped running `prepare` on git dependencies after
 * CVE-2025-69264, and the dashboard is on pnpm while the app is on npm — so a
 * build-on-install step would leave one of them working and the other silently
 * installing a package with no files in it.
 *
 * UTF-8 by name, everywhere. `FincgxMobile/scripts/pull-bundles.mjs` learned
 * this the expensive way: its first version piped curl through a shell and the
 * console's encoding turned every `é` into `Ã©` — valid UTF-8 holding the wrong
 * characters, so nothing complained and every accented French label was quietly
 * wrong. The reasons in tokens.json are written in English prose with em dashes
 * and accented place names, and they travel into both outputs.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKENS = join(HERE, "..", "tokens");

const read = (p) => readFileSync(p, { encoding: "utf8" });
const write = (p, s) => writeFileSync(p, s, { encoding: "utf8" });

export const source = JSON.parse(read(join(TOKENS, "tokens.json")));

const BANNER = (file) =>
  `Generated from tokens/tokens.json. Do not edit.\n` +
  `Edit the source and run \`npm run build\`; ${file} is output, not input.`;

/** Wrap prose at 76 columns so a reason stays readable in both outputs. */
function wrap(text, indent) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if (line && line.length + word.length + 1 > 76 - indent.length) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * One colour entry, resolved for a platform and a mode.
 *
 * Returns null when the entry is a `$why`/`$about` note rather than a colour,
 * so a group can carry its reasoning in the same object as its values.
 */
export function resolve(entry, platform, mode) {
  if (entry === null || entry === undefined) return null;
  if (typeof entry === "string") return entry;
  if (typeof entry !== "object") return null;
  if (typeof entry.value === "string") return entry.value;
  const scope = entry[platform] ?? entry;
  const value = scope?.[mode];
  return typeof value === "string" ? value : null;
}

/** Every colour token, flattened: [name, {light, dark}, why]. */
export function colours(platform) {
  const out = [];
  const groups = [
    ["color", source.color],
    ["shell", source.shell],
    ["chart", source.chart],
    ["severity", source.severity],
  ];
  for (const [group, entries] of groups) {
    // The shell is the dashboard's sidebar; the app has no shell to paint.
    if (group === "shell" && platform !== "web") continue;
    for (const [name, entry] of Object.entries(entries)) {
      if (name.startsWith("$")) continue;
      const light = resolve(entry, platform, "light");
      const dark = resolve(entry, platform, "dark");
      if (light === null && dark === null) continue;
      out.push({
        name,
        light: light ?? dark,
        dark: dark ?? light,
        why: entry?.$why ?? null,
      });
    }
  }
  for (const [step, value] of Object.entries(source.brand)) {
    if (step.startsWith("$")) continue;
    out.push({ name: `brand-${step}`, light: value, dark: value, why: null, ramp: true });
  }
  return out;
}

/**
 * The eleven ramp steps, which the web emits into `@theme` rather than as
 * custom properties because they do not change by mode.
 *
 * Flagged where they are built rather than matched on their names. Written the
 * obvious way first — a prefix match on the ramp's own name — this silently
 * swallowed `brand-soft` and `brand-strong` as well, and shipped a release where
 * the dashboard's selected filter pill had no background at all. The contrast
 * test did not catch it because it reads the source; `test/output.test.mjs` now
 * reads what is actually generated.
 */
const isRampStep = (token) => token.ramp === true;

// -------------------------------------------------------------------- //
// Web: custom properties, light-first, re-mapped for dark
// -------------------------------------------------------------------- //

/**
 * The custom property the dashboard publishes a loaded face under.
 *
 * Derived rather than written down, because the pair it has to match is in
 * another repo: `next/font` names the variable in `app/layout.tsx` and this
 * names it here, and nothing connects them but agreement. These two lines used
 * to read `--font-plex-sans` as a literal, which survived the move to Manrope
 * by not being wrong in a way anything could see — the variable would simply
 * have gone undefined and every face fallen back to `ui-sans-serif`.
 *
 * So the rule is the name: `"IBM Plex Mono"` is `--font-ibm-plex-mono`, and a
 * face named in `tokens.json` is a face the dashboard can look up without being
 * told twice.
 */
const faceVar = (family) => `--font-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

function css() {
  const tokens = colours("web");
  const lines = [`/*\n * ${BANNER("tokens.css").split("\n").join("\n * ")}\n */\n`];

  lines.push("@theme {");
  for (const [step, value] of Object.entries(source.brand)) {
    if (step.startsWith("$")) continue;
    lines.push(`  --color-brand-${step}: ${value};`);
  }
  lines.push("");
  lines.push(
    `  --font-sans: var(${faceVar(source.font.sans)}), ui-sans-serif, system-ui, sans-serif;`,
  );
  lines.push(`  --font-mono: var(${faceVar(source.font.mono)}), ui-monospace, monospace;`);
  lines.push("");
  for (const [role, sizes] of Object.entries(source.type)) {
    if (role.startsWith("$") || role === "mono") continue;
    const [size, leading, weight] = sizes.web;
    lines.push(`  --text-${role}: ${size / 16}rem;`);
    lines.push(`  --text-${role}--line-height: ${leading / 16}rem;`);
    lines.push(`  --text-${role}--font-weight: ${weight};`);
  }
  lines.push("}\n");

  /*
   * `mono` is a utility and not a `--text-*` entry, because on the web the
   * family is half the role. A `--text-mono` theme entry makes Tailwind emit a
   * `.text-mono` that sets size, leading and weight and *not* family, which is
   * a class whose name says monospace and whose output does not.
   *
   * That is not hypothetical. Moving the scale into this package turned the
   * dashboard's hand-written utility into a theme entry, and for the whole of
   * that time every account number, collection code and payment reference on
   * the web rendered in the sans — on sixteen call sites, with no error, no
   * failing test and nothing to see unless you knew the shape of the digits.
   * Found by reading a computed `fontFamily` back out of a browser.
   *
   * The alternative is writing `font-mono text-mono` at every site: two names
   * for one role, which is the thing this scale exists to stop.
   */
  const [monoSize, monoLeading, monoWeight] = source.type.mono.web;
  lines.push("@utility text-mono {");
  lines.push("  font-family: var(--font-mono);");
  lines.push(`  font-size: ${monoSize / 16}rem;`);
  lines.push(`  line-height: ${monoLeading / 16}rem;`);
  lines.push(`  font-weight: ${monoWeight};`);
  lines.push("}\n");

  /**
   * Light carries the reasons; dark is the same list of names with other
   * values, and repeating the prose there would be two copies to keep in step.
   */
  const scheme = (mode) =>
    tokens
      .filter((t) => !isRampStep(t))
      .flatMap((t) => {
        const value = `  --${t.name}: ${mode === "light" ? t.light : t.dark};`;
        if (mode !== "light" || !t.why) return [value];
        return ["", `  /*`, ...wrap(t.why, "   * ").map((l) => `   * ${l}`), `   */`, value];
      })
      .join("\n");

  lines.push(":root {\n  color-scheme: light;\n");
  lines.push(scheme("light"));
  lines.push("}\n");
  lines.push("@media (prefers-color-scheme: dark) {");
  lines.push("  :root:not([data-theme=\"light\"]) {\n    color-scheme: dark;\n");
  lines.push(
    scheme("dark")
      .split("\n")
      .map((l) => `  ${l}`)
      .join("\n"),
  );
  lines.push("  }\n}\n");

  // Tailwind utilities, pointed at the properties above.
  lines.push("@theme inline {");
  for (const token of tokens.filter((t) => !isRampStep(t))) {
    lines.push(`  --color-${token.name}: var(--${token.name});`);
  }
  lines.push("}");

  return lines.join("\n") + "\n";
}

// -------------------------------------------------------------------- //
// App: a typed palette per scheme
// -------------------------------------------------------------------- //

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

function palette() {
  const tokens = colours("app");
  const keys = tokens.map((t) => camel(t.name));

  const body = (mode) =>
    tokens
      .map((t) => `  ${camel(t.name)}: ${JSON.stringify(mode === "light" ? t.light : t.dark)},`)
      .join("\n");

  const js = `/*
 * ${BANNER("palette.js").split("\n").join("\n * ")}
 */

export const LIGHT = {
  scheme: "light",
${body("light")}
};

export const DARK = {
  scheme: "dark",
${body("dark")}
};

export const TYPE = {
${Object.entries(source.type)
  .filter(([role]) => !role.startsWith("$"))
  .map(([role, sizes]) => {
    const [fontSize, lineHeight, fontWeight] = sizes.app;
    return `  ${camel(role)}: { fontSize: ${fontSize}, lineHeight: ${lineHeight}, fontWeight: "${fontWeight}" },`;
  })
  .join("\n")}
};

export const FONT = {
  sans: ${JSON.stringify(source.font.sans)},
  mono: ${JSON.stringify(source.font.mono)},
  weights: ${JSON.stringify(source.font.weights)},
  faces: {
    sans: ${JSON.stringify(source.font.faces.sans)},
    mono: ${JSON.stringify(source.font.faces.mono)},
  },
};

export const SPACE = ${JSON.stringify(source.space, null, 2).replace(/\n/g, "\n")};

export const RADIUS = ${JSON.stringify(source.radius, null, 2).replace(/\n/g, "\n")};

export const TAP_TARGET = ${source["tap-target"].value};
`;

  const types = `/*
 * ${BANNER("palette.d.ts").split("\n").join("\n * ")}
 */

export type Palette = {
  scheme: "light" | "dark";
${keys.map((k) => `  ${k}: string;`).join("\n")}
};

export type TypeRole = {
  fontSize: number;
  lineHeight: number;
  fontWeight: "400" | "500" | "600";
};

export declare const LIGHT: Palette;
export declare const DARK: Palette;
export declare const TYPE: Record<
${Object.keys(source.type)
  .filter((r) => !r.startsWith("$"))
  .map((r) => `  | "${camel(r)}"`)
  .join("\n")},
  TypeRole
>;
export declare const FONT: {
  sans: string;
  mono: string;
  weights: number[];
  /** PostScript names, which is what React Native resolves a fontFamily to. */
  faces: {
    sans: Record<"400" | "500" | "600", string>;
    mono: Record<"500", string>;
  };
};
export declare const SPACE: Record<"xs" | "sm" | "md" | "lg" | "xl" | "xxl", number>;
export declare const RADIUS: Record<"sm" | "md" | "lg" | "pill", number>;
export declare const TAP_TARGET: number;
`;

  /*
   * The same palette as CommonJS.
   *
   * Metro and Next both read the ESM file happily; Jest does not, because it
   * runs as CommonJS and will not transform anything under node_modules unless
   * the consumer edits `transformIgnorePatterns` — which is exactly the
   * "configure your bundler" tax this package is supposed to avoid. Shipping
   * both and letting `exports` choose means it simply works in any consumer.
   *
   * Generated from the same source in the same run, so the two cannot drift.
   */
  const cjs = js
    .replace(/^export const /gm, "const ")
    .concat(
      `
module.exports = { LIGHT, DARK, TYPE, FONT, SPACE, RADIUS, TAP_TARGET };
`,
    );

  return { js, cjs, types };
}

// -------------------------------------------------------------------- //
// docs/tokens.md — the reference half of the catalogue
// -------------------------------------------------------------------- //

/**
 * Generated for the same reason the code is: a token table maintained by hand
 * is a token table that is wrong by the second release, and a catalogue nobody
 * trusts is worse than no catalogue.
 */
function reference() {
  const web = colours("web");
  const app = Object.fromEntries(colours("app").map((t) => [t.name, t]));

  const row = (t) => {
    const a = app[t.name];
    const same = a && a.light === t.light && a.dark === t.dark;
    const appCell = !a ? "— *web only*" : same ? "same" : `\`${a.light}\` / \`${a.dark}\``;
    return `| \`${t.name}\` | \`${t.light}\` | \`${t.dark}\` | ${appCell} |`;
  };

  const section = (title, filter) =>
    [
      `### ${title}`,
      "",
      "| token | web light | web dark | app |",
      "| --- | --- | --- | --- |",
      ...web.filter(filter).map(row),
      "",
    ].join("\n");

  const reasons = web
    .filter((t) => t.why)
    .map((t) => `**\`${t.name}\`** — ${t.why}`)
    .join("\n\n");

  return `<!-- ${BANNER("docs/tokens.md").split("\n").join("\n     ")} -->

# Token reference

Every token, both platforms, both modes. \`same\` means the two platforms
resolved to the same value, which is the goal rather than the rule — where they
differ, the reason is at the bottom of this page.

${section("Surfaces and ink", (t) => /^(background|surface|line|ink|overlay)/.test(t.name))}
${section("Brand", (t) => t.name.startsWith("brand"))}
${section("Tones", (t) => /^(success|warn|danger|info|neutral)/.test(t.name))}
${section("Shell — the dashboard's sidebar", (t) => t.name.startsWith("shell"))}
${section("Charts", (t) => t.name.startsWith("chart"))}
${section("Severity — the PAR ramp", (t) => t.name.startsWith("severity"))}
### Type

| role | web | app | weight |
| --- | --- | --- | --- |
${Object.entries(source.type)
  .filter(([role]) => !role.startsWith("$"))
  .map(([role, s]) => `| \`${role}\` | ${s.web[0]} / ${s.web[1]} | ${s.app[0]} / ${s.app[1]} | ${s.web[2]} |`)
  .join("\n")}

Set in **${source.font.sans}**, with **${source.font.mono}** for the \`mono\`
role, at weights ${source.font.weights.join(" / ")}.

### Spacing, radii, targets

${Object.entries(source.space).map(([k, v]) => `\`space.${k}\` ${v}`).join(" · ")}

${Object.entries(source.radius).map(([k, v]) => `\`radius.${k}\` ${v}`).join(" · ")}

\`tapTarget\` ${source["tap-target"].value} — ${source["tap-target"].$why}

---

## Why these values

${reasons}
`;
}

/**
 * Everything this generates, as text, keyed by where it belongs.
 *
 * Separated from writing it so the tests can regenerate in memory and compare
 * against what is committed — without a build step that would paper over the
 * difference by rewriting the files first.
 */
export function render() {
  const { js, cjs, types } = palette();
  return {
    "tokens/tokens.css": css(),
    "tokens/palette.js": js,
    "tokens/palette.cjs": cjs,
    "tokens/palette.d.ts": types,
    "docs/tokens.md": reference(),
  };
}

if (process.argv[1] && process.argv[1].endsWith("generate.mjs")) {
  const files = render();
  for (const [path, text] of Object.entries(files)) {
    write(join(HERE, "..", path), text);
  }
  console.log(
    `${Object.keys(files).length} files — ` +
      `${colours("web").length} colours, ${Object.keys(source.type).length - 1} type roles`,
  );
}
