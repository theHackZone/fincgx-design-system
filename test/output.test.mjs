/**
 * Does everything in the source actually reach both outputs?
 *
 * This exists because of a bug it would have caught on the first run.
 * `brand-soft` and `brand-strong` were dropped by a filter meant to exclude the
 * eleven ramp steps, which matched on the `brand-` prefix and swallowed them
 * too. Nothing complained: the contrast test reads `tokens.json`, so every
 * assertion about those colours passed while neither generated file contained
 * them — and the dashboard shipped a release where the selected filter pill had
 * no background at all.
 *
 * So the rule is: the contrast test says the palette is right, and this one says
 * the palette is *there*. A generator with no check on its output is a check on
 * nothing.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { colours, source } from "../scripts/generate.mjs";

const TOKENS = join(dirname(fileURLToPath(import.meta.url)), "..", "tokens");
const css = readFileSync(join(TOKENS, "tokens.css"), "utf8");
const js = readFileSync(join(TOKENS, "palette.js"), "utf8");
const dts = readFileSync(join(TOKENS, "palette.d.ts"), "utf8");

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

/**
 * A ramp step arrives as `--color-brand-500` inside `@theme`; everything else
 * arrives as `--name` in `:root` and is mapped to a utility afterwards. Both
 * count as emitted, and nothing else does.
 */
const inStylesheet = (name, text = css) =>
  new RegExp(`--(?:color-)?${name}\\s*:`).test(text);

test("every colour in the source reaches the stylesheet", () => {
  const missing = colours("web")
    .filter((t) => !inStylesheet(t.name))
    .map((t) => t.name);
  assert.deepEqual(missing, [], `Not emitted into tokens.css: ${missing.join(", ")}`);
});

test("every colour the stylesheet defines is reachable as a utility", () => {
  // A property nothing maps into `@theme inline` is a value no class can use,
  // which looks exactly like the value being absent.
  const defined = [...css.matchAll(/^\s{2}--([a-z0-9-]+):/gm)]
    .map((m) => m[1])
    .filter((n) => !n.startsWith("text-") && !n.startsWith("font-") && !n.startsWith("color-"));
  const mapped = new Set([...css.matchAll(/--color-([a-z0-9-]+): var\(/g)].map((m) => m[1]));
  const orphans = defined.filter((n) => !mapped.has(n));
  assert.deepEqual(orphans, [], `Defined but not exposed as a utility: ${orphans.join(", ")}`);
});

test("every colour in the source reaches the palette", () => {
  const missing = colours("app")
    .filter((t) => !new RegExp(`\\b${camel(t.name)}\\s*:`).test(js))
    .map((t) => t.name);
  assert.deepEqual(missing, [], `Not emitted into palette.js: ${missing.join(", ")}`);
});

test("the CommonJS build exports the same palette as the ESM one", () => {
  // Two files, one source, and nothing stopping them from drifting except this.
  const cjs = readFileSync(join(TOKENS, "palette.cjs"), "utf8");
  for (const name of ["LIGHT", "DARK", "TYPE", "FONT", "SPACE", "RADIUS", "TAP_TARGET"]) {
    assert.ok(new RegExp(`\\b${name}\\b`).test(cjs), `${name} missing from palette.cjs`);
  }
  assert.ok(/module\.exports = \{/.test(cjs), "palette.cjs should export via module.exports");
  assert.ok(!/^export /m.test(cjs), "palette.cjs should carry no ESM exports");
  // The values themselves, not just the names.
  for (const token of colours("app")) {
    assert.ok(
      cjs.includes(`${camel(token.name)}: ${JSON.stringify(token.light)}`),
      `${token.name} missing or wrong in palette.cjs`,
    );
  }
});

test("the declared type matches what the palette actually exports", () => {
  const declared = new Set(
    [...dts.matchAll(/^\s{2}([a-zA-Z0-9]+):\s*string;/gm)].map((m) => m[1]),
  );
  const exported = colours("app").map((t) => camel(t.name));
  const undeclared = exported.filter((k) => !declared.has(k));
  assert.deepEqual(undeclared, [], `In palette.js but not in Palette: ${undeclared.join(", ")}`);
});

test("both outputs agree with the source on the ramp and the type scale", () => {
  for (const [step, value] of Object.entries(source.brand)) {
    if (step.startsWith("$")) continue;
    assert.ok(
      css.includes(`--color-brand-${step}: ${value};`),
      `brand-${step} should be ${value} in tokens.css`,
    );
  }
  for (const [role, sizes] of Object.entries(source.type)) {
    if (role.startsWith("$")) continue;
    // `mono` is a utility rather than a theme entry; see the next test.
    const web =
      role === "mono"
        ? `font-size: ${sizes.web[0] / 16}rem;`
        : `--text-${role}: ${sizes.web[0] / 16}rem;`;
    assert.ok(css.includes(web), `${role} should be ${sizes.web[0]}px on the web`);
    assert.ok(
      new RegExp(`${camel(role)}: \\{ fontSize: ${sizes.app[0]},`).test(js),
      `${role} should be ${sizes.app[0]}dp in the app`,
    );
  }
});

/**
 * `.text-mono` names a family, and a `--text-mono` theme entry cannot.
 *
 * Tailwind generates a size utility from a `--text-*` entry, and a size utility
 * sets size, leading and weight. For seven of the eight roles that is the whole
 * role. For `mono` the family is half of it, so the entry produced a class
 * called `text-mono` that rendered in the sans.
 *
 * It shipped that way: moving the scale into this package replaced the
 * dashboard's hand-written `@utility` with a theme entry, and sixteen call
 * sites — account numbers, collection codes, payment references, the strings
 * the role exists to make unambiguous — set in a proportional face with nothing
 * failing anywhere. This is the assertion that was missing.
 */
test("the mono role carries its own family", () => {
  const block = /@utility\s+text-mono\s*\{([^}]*)\}/.exec(css);
  assert.ok(block, "tokens.css should define `@utility text-mono`");
  assert.ok(
    block[1].includes("font-family: var(--font-mono)"),
    "`.text-mono` must set the family; a size utility alone renders in the sans",
  );
  assert.ok(
    !css.includes("--text-mono:"),
    "a `--text-mono` theme entry would generate a size-only `.text-mono` beside this one",
  );
});

test("nothing is generated that no longer has a source", () => {
  const known = new Set(colours("web").map((t) => t.name));
  const stale = [...css.matchAll(/--color-([a-z0-9-]+): var\(/g)]
    .map((m) => m[1])
    .filter((n) => !known.has(n));
  assert.deepEqual(stale, [], `In tokens.css with no entry in tokens.json: ${stale.join(", ")}`);
});

/**
 * The guard, pointed at a fixture of the bug it exists to catch — the exact
 * shape of the one that got through.
 */
test("the scan would notice a colour that stopped being emitted", () => {
  const withoutBrandSoft = css.replace(/^\s*--(?:color-)?brand-soft:.*$/gm, "");
  const missing = colours("web").filter((t) => !inStylesheet(t.name, withoutBrandSoft));
  assert.deepEqual(
    missing.map((t) => t.name),
    ["brand-soft"],
    "removing a property from the output should leave exactly that token missing",
  );
});

/**
 * The font the source names is the font the output asks for.
 *
 * These two lines read `--font-plex-sans` as a literal until the face changed,
 * and the literal is the kind of wrong nothing catches: the custom property
 * would simply have gone undefined and every face quietly fallen back to
 * `ui-sans-serif`. The dashboard still has to publish the variable under this
 * name from `next/font`, which no test here can reach — `lib/type-scale.test.ts`
 * over there asserts that half against the installed package.
 */
test("the stylesheet asks for the face the source names", () => {
  const varName = (family) => `--font-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  for (const role of ["sans", "mono"]) {
    const expected = `--font-${role}: var(${varName(source.font[role])})`;
    assert.ok(
      css.includes(expected),
      `tokens.css should contain "${expected}" — the source names ${source.font[role]}`,
    );
  }
});

/**
 * Every weight the scale asks for has a face to render it.
 *
 * On a phone a weight *is* a file, so a role set at 500 with no `500` entry
 * below renders in whatever the platform substitutes — on one platform, which
 * is the half of this that never shows up in a screenshot.
 */
test("every weight in the type scale has a face named for it", () => {
  const needed = new Set(
    Object.entries(source.type)
      .filter(([role]) => !role.startsWith("$"))
      .filter(([role]) => role !== "mono")
      .map(([, sizes]) => String(sizes.app[2])),
  );

  assert.deepEqual(
    [...needed].sort(),
    Object.keys(source.font.faces.sans).sort(),
    "the sans faces and the weights the app scale uses should be the same set",
  );
  assert.deepEqual(
    Object.keys(source.font.faces.mono),
    [String(source.type.mono.app[2])],
    "the mono face should be named for the weight the mono role is set at",
  );
});
