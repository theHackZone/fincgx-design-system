# @fincgx/design-system

One source for the Fin&CGX palette, type scale and spacing, consumed by
[`fincgx-dashboard`](https://github.com/theHackZone/fincgx-dashboard) (Next.js,
pnpm) and `FincgxMobile` (bare React Native, npm).

Named for what it will hold rather than what it holds today. Tokens are the only
thing in it at the start; icons, illustration and the catalogue below are the
reason it is not called `fincgx-tokens` and renamed in six months.

## Install

```jsonc
"@fincgx/design-system": "github:theHackZone/fincgx-design-system#v1.0.0"
```

Both package managers resolve that plain reference, which is why **the repo root
is the package**. A `packages/tokens` child would be the conventional monorepo
layout and it only installs on pnpm — `#path:/packages/tokens` is a pnpm
extension and npm has no equivalent. The dashboard is pnpm and the app is npm,
so a nested package would give one platform that installs and one that cannot.

Growth is by subpath export, not by sibling package. Anything that is not code —
`docs/`, `brand/` — simply is not in `files`, so it never lands in either app's
`node_modules`.

A pinned tag resolves to a commit SHA in both lockfiles, which is the point of
this being a repo rather than a sync script: the app can sit a version behind the
dashboard **on purpose**, and say so in a diff.

## Use

**Web** — import the stylesheet before anything that uses it:

```css
@import "tailwindcss";
@import "@fincgx/design-system/tokens/tokens.css";
```

It carries `@theme` (the brand ramp, the font roles, the type scale), the
light-first custom properties with their dark remapping, and the `@theme inline`
block that turns each one into a utility — `bg-surface`, `text-ink-muted`,
`border-line`.

**App** — import the palette:

```ts
import { LIGHT, DARK, TYPE, SPACE, RADIUS, TAP_TARGET } from "@fincgx/design-system/tokens";
```

Plain JS with a `.d.ts` beside it, not TypeScript source. JSON and JS imports work
natively in both Next.js and Metro; TypeScript inside `node_modules` depends on
Metro's transform reaching it, which is a bundler config nobody should have to own.

## Change a token

1. Edit `tokens/tokens.json`. It is the only hand-edited file here.
2. `npm run build`
3. `npm test`
4. Commit the generated files with the source, and tag.

**The generated output is committed on purpose.** pnpm 10.26 stopped running
`prepare` on git dependencies after CVE-2025-69264 unless the package is
allowlisted; npm still runs it. A build-on-install step would therefore leave the
app working and the dashboard silently installing a package with no files in it —
the same asymmetric failure as the layout trap above, from a different direction.
Committing the output removes the whole class: no `prepare`, no toolchain on the
consumer, no allowlist.

No build tool. Style Dictionary and Terrazzo are both good and both earn their
config when something unusual is in the file; `scripts/generate.mjs` is shorter
than the config that would replace it. Revisit when designers want to own the
palette in Figma — Tokens Studio plus `@tokens-studio/sd-transforms` is the route
in — or when a third consumer appears.

## The tests are the palette's memory

`npm test` is a contrast check over the generated output, and it is the reason
this is a package rather than a JSON file in a Gist. Every assertion is something
that was measured in one of the two apps, and a token file is exactly where such
a thing gets flattened into a hex code and rounded off by the next person
adjusting it.

It found two real defects on its first run, both of which had been shipping:

- **The PAR ramp's amber and orange were invisible on a white card** — 1.83 and
  2.64 against the 3:1 that a bar segment needs. Darkened to 3.07 and 3.06, which
  they clear while still clearing the dark card, so the ramp stays fixed across
  modes as it was meant to.
- **The faintest ink was 2.58 on a white card**, carrying the eyebrow label over
  every figure on the dashboard. Now 3.06. It is still short of the 4.5 that
  small text is owed, and that is in [docs/open-questions.md](docs/open-questions.md)
  rather than quietly waived — closing it means having two text greys instead of
  three, which is a designer's decision.

A second suite, `test/output.test.mjs`, checks that the palette is *there* — that
every token in the source reaches both generated files, that nothing is mapped to
a utility without a value behind it, and that nothing is generated with no source
left. It exists because of a bug it would have caught on its first run: a filter
meant to exclude the eleven ramp steps matched on the `brand-` prefix and
swallowed `brand-soft` and `brand-strong` with them. Nothing complained, because
the contrast check reads the source — and v1.1.0 shipped with the dashboard's
selected filter pill having no background at all.

Both suites are planted: one breaks a token on purpose and asserts the contrast
checker says so, the other removes a property from the output and asserts the
scan names exactly that token. A check that cannot fail is worse than none,
because somebody will trust it.

## Layout

```
tokens/
  tokens.json     the source, hand-edited
  tokens.css      generated — web
  palette.js      generated — app
  palette.d.ts    generated — app types
scripts/
  generate.mjs    the generator
  contrast.mjs    WCAG ratio, small enough to own
test/
  contrast.test.mjs
docs/
  catalogue.md       what each component is, on both platforms
  tokens.md          generated — every token, both platforms, both modes
  open-questions.md  what is known to be unresolved
```
