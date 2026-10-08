/**
 * Does the committed output still match the source it came from?
 *
 * This is the hazard that comes with `main` being the release. The generated
 * files are committed — they have to be, because pnpm will not run `prepare` on
 * a git dependency — so nothing except this stops somebody editing
 * `tokens.json`, forgetting `npm run build`, and pushing a source that disagrees
 * with its own output. Both apps would then install a palette that no file in
 * the repo describes.
 *
 * With a tag, that mistake had a second chance to be caught while cutting the
 * release. Without one it goes straight to both consumers, so the check moves
 * here, where it runs on every commit.
 *
 * It regenerates in memory and compares. It does not write, so a failing test
 * never quietly fixes itself and then passes on a re-run.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { render } from "../scripts/generate.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Compare as lines, so a failure says which one rather than "they differ". */
function assertSame(path, expected) {
  const actual = readFileSync(join(ROOT, path), "utf8");
  if (actual === expected) return;

  const a = actual.split("\n");
  const b = expected.split("\n");
  const at = a.findIndex((line, i) => line !== b[i]);
  assert.fail(
    `${path} is not what tokens.json generates — run \`npm run build\`.\n` +
      `  first difference at line ${at + 1}:\n` +
      `    committed:  ${JSON.stringify(a[at] ?? "(end of file)")}\n` +
      `    generated:  ${JSON.stringify(b[at] ?? "(end of file)")}`,
  );
}

const generated = render();

for (const path of Object.keys(generated)) {
  test(`${path} is what tokens.json generates`, () => {
    assertSame(path, generated[path]);
  });
}

/**
 * The guard, pointed at a fixture of the bug it exists to catch: a source edited
 * without a rebuild. Without this, the tests above pass identically whether the
 * comparison works or compares a file with itself.
 */
test("the check would notice a source edited without a rebuild", () => {
  const tampered = { ...generated, "tokens/tokens.css": generated["tokens/tokens.css"] + "\n/* edited */\n" };
  assert.throws(
    () => assertSame("tokens/tokens.css", tampered["tokens/tokens.css"]),
    /is not what tokens\.json generates/,
  );
});
