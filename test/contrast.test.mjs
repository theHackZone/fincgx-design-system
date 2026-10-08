/**
 * The palette's measured facts, as a test.
 *
 * A token file is exactly where a reason gets flattened into a hex code and
 * then rounded off by the next person adjusting it. Every rule below is
 * something that was actually measured in one of the two apps, and the point of
 * putting it here rather than in a comment is that a release cannot carry a
 * token that breaks it — rather than it being caught by whichever app upgrades
 * first and happens to look at the right screen.
 *
 * Thresholds are WCAG 2.1: 4.5 for text, 3 for large text and for a graphical
 * object that has to be told apart from its ground.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { contrast } from "../scripts/contrast.mjs";
import { colours, resolve, source } from "../scripts/generate.mjs";

const TEXT = 4.5;
const OBJECT = 3;

/** Resolved colours for one platform and mode, by token name. */
function palette(platform, mode) {
  const out = {};
  for (const token of colours(platform)) {
    out[token.name] = mode === "light" ? token.light : token.dark;
  }
  return out;
}

const WEB = { light: palette("web", "light"), dark: palette("web", "dark") };
const APP = { light: palette("app", "light"), dark: palette("app", "dark") };

/** Assert and say the number, because a bare pass tells you nothing later. */
function atLeast(fg, bg, floor, what) {
  const ratio = contrast(fg, bg);
  assert.notEqual(ratio, null, `${what}: ${fg} on ${bg} is not a plain hex`);
  assert.ok(ratio >= floor, `${what}: ${fg} on ${bg} is ${ratio}, needs ${floor}`);
  return ratio;
}

function below(fg, bg, ceiling, what) {
  const ratio = contrast(fg, bg);
  assert.notEqual(ratio, null, `${what}: ${fg} on ${bg} is not a plain hex`);
  assert.ok(ratio < ceiling, `${what}: ${fg} on ${bg} is ${ratio}, expected under ${ceiling}`);
  return ratio;
}

test("the brand blue carries light surfaces and cannot carry the shell", () => {
  const blue = source.brand["600"];
  atLeast(blue, "#ffffff", TEXT, "brand blue on white");
  // This is the fact that decides where the wordmark may go. If somebody
  // lightens the ramp until this passes, the logo's own rule has changed and
  // that should be a conversation rather than a diff nobody read.
  below(blue, WEB.light.shell, OBJECT, "brand blue on the shell");
});

test("the brand yellow carries dark grounds and can never be text on white", () => {
  const yellow = resolve(source.color["brand-yellow"], "web", "light");
  atLeast(yellow, "#000000", TEXT, "brand yellow on black");
  below(yellow, "#ffffff", OBJECT, "brand yellow on white");
  // Which is why there is a second one, taken down until it clears a light
  // surface as a chart fill.
  atLeast(resolve(source.color["brand-yellow-ink"], "web", "light"), "#ffffff", OBJECT, "yellow ink on white");
});

test("the active nav pill is brand-500, and 400 and 600 are why", () => {
  const shell = WEB.light.shell;
  atLeast(source.brand["500"], shell, OBJECT, "brand-500 fill on the shell");
  atLeast("#ffffff", source.brand["500"], TEXT, "white label on brand-500");

  // The two neighbours, each failing one half of the pair. Asserted so the
  // step is not quietly moved to a rounder number.
  below(source.brand["600"], shell, OBJECT, "brand-600 fill on the shell");
  below("#ffffff", source.brand["400"], TEXT, "white label on brand-400");
});

test("the shell's own text clears the black it sits on", () => {
  atLeast(WEB.light["shell-ink"], WEB.light.shell, TEXT, "shell ink");
  // Dimmed, but a sidebar label is still text, so it holds the large-text floor.
  atLeast(WEB.light["shell-ink-muted"], WEB.light.shell, OBJECT, "shell ink, muted");
});

for (const [name, sets] of [
  ["web", WEB],
  ["app", APP],
]) {
  for (const mode of ["light", "dark"]) {
    const p = sets[mode];

    test(`${name} ${mode}: text clears the two grounds it is drawn on`, () => {
      for (const ground of ["background", "surface"]) {
        atLeast(p.ink, p[ground], TEXT, `${name} ${mode} ink on ${ground}`);
        atLeast(p["ink-muted"], p[ground], TEXT, `${name} ${mode} ink-muted on ${ground}`);
      }
      // The faintest step is held to 3, not 4.5, and that is a known shortfall
      // rather than the right threshold: it carries small text set in caps, so
      // the standard asks 4.5. At 4.5 on white it lands on top of ink-muted and
      // the third step stops existing, which is a design decision and not one a
      // token file should make on its own. Floored here so it cannot get worse,
      // and written down in docs/open-questions.md so it does not get forgotten.
      atLeast(p["ink-subtle"], p.surface, OBJECT, `${name} ${mode} ink-subtle on a card`);
    });

    test(`${name} ${mode}: a hairline is visible against what it divides`, () => {
      atLeast(p["line-strong"], p.surface, 1.3, `${name} ${mode} line-strong on surface`);
    });

    test(`${name} ${mode}: both chart slots clear their own surface, and each other`, () => {
      atLeast(p["chart-series-1"], p.surface, OBJECT, `${name} ${mode} series 1`);
      atLeast(p["chart-series-2"], p.surface, OBJECT, `${name} ${mode} series 2`);
      // Not a WCAG rule: two adjacent fills are told apart by hue, and both
      // palettes say so in their own comments. This is the cruder check that
      // somebody has not set both slots to the same colour, or to two steps of
      // one ramp — which is the mistake a palette merge actually makes.
      atLeast(p["chart-series-1"], p["chart-series-2"], 1.5, `${name} ${mode} the two slots`);
    });

    test(`${name} ${mode}: every tone is readable on its own soft ground`, () => {
      for (const tone of ["success", "warn", "danger", "info", "neutral"]) {
        atLeast(p[tone], p[`${tone}-soft`], TEXT, `${name} ${mode} ${tone}`);
      }
    });
  }
}

test("the severity ramp stays legible on both surfaces, in both modes", () => {
  for (const step of ["good", "warning", "serious", "critical"]) {
    for (const mode of ["light", "dark"]) {
      atLeast(WEB[mode][`severity-${step}`], WEB[mode].surface, OBJECT, `severity ${step} ${mode}`);
    }
  }
});

/**
 * The guard, pointed at a fixture of the bug it exists to catch.
 *
 * Without this, every assertion above passes identically whether `contrast`
 * works or returns a large number for everything — and a palette check that
 * cannot fail is worse than no palette check, because somebody will trust it.
 */
test("the check would catch a token that stopped clearing its ground", () => {
  // A plausible mistake: muted text nudged one step lighter to "soften" it.
  const nudged = "#aeb6c2";
  assert.ok(
    contrast(nudged, WEB.light.background) < TEXT,
    "a lightened muted ink should fail against the page",
  );
  assert.throws(
    () => atLeast(nudged, WEB.light.background, TEXT, "planted"),
    /planted: #aeb6c2 on #f6f7f9 is [\d.]+, needs 4\.5/,
  );

  // And the arithmetic itself, against values with a known answer.
  assert.equal(contrast("#000000", "#ffffff"), 21);
  assert.equal(contrast("#ffffff", "#ffffff"), 1);
});
