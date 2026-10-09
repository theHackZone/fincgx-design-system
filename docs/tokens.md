<!-- Generated from tokens/tokens.json. Do not edit.
     Edit the source and run `npm run build`; docs/tokens.md is output, not input. -->

# Token reference

Every token, both platforms, both modes. `same` means the two platforms
resolved to the same value, which is the goal rather than the rule — where they
differ, the reason is at the bottom of this page.

### Surfaces and ink

| token | web light | web dark | app |
| --- | --- | --- | --- |
| `background` | `#f6f7f9` | `#0a0e12` | `#f4f5f7` / `#0e1116` |
| `surface` | `#ffffff` | `#171d24` | `#ffffff` / `#171c23` |
| `surface-inset` | `#ffffff` | `#10151a` | `#f7f8fa` / `#1f252e` |
| `surface-pressed` | `#eceef2` | `#232c36` | `#eceef2` / `#242b35` |
| `line` | `#e4e7ec` | `#232c36` | `#e3e6ea` / `#2a3139` |
| `line-strong` | `#d0d5dd` | `#333f4d` | `#cbd1d9` / `#3a434e` |
| `ink` | `#101828` | `#e8edf3` | `#14181f` / `#eef1f5` |
| `ink-muted` | `#667085` | `#97a3b1` | `#5b6472` / `#a3adba` |
| `ink-subtle` | `#8994a8` | `#6d7986` | `#8b95a3` / `#75808e` |
| `ink-inverse` | `#ffffff` | `#0e1116` | same |
| `overlay` | `rgba(20, 24, 31, 0.45)` | `rgba(0, 0, 0, 0.6)` | same |

### Brand

| token | web light | web dark | app |
| --- | --- | --- | --- |
| `brand-yellow` | `#ced218` | `#ced218` | same |
| `brand-yellow-ink` | `#8c8f10` | `#8c8f10` | same |
| `brand` | `#0a31e3` | `#768cef` | same |
| `brand-strong` | `#0827b4` | `#9dadf4` | same |
| `brand-soft` | `#e7eafc` | `#05104b` | same |
| `brand-50` | `#f5f7fe` | `#f5f7fe` | same |
| `brand-100` | `#e7eafc` | `#e7eafc` | same |
| `brand-200` | `#c9d2f9` | `#c9d2f9` | same |
| `brand-300` | `#9dadf4` | `#9dadf4` | same |
| `brand-400` | `#768cef` | `#768cef` | same |
| `brand-500` | `#3152e7` | `#3152e7` | same |
| `brand-600` | `#0a31e3` | `#0a31e3` | same |
| `brand-700` | `#0827b4` | `#0827b4` | same |
| `brand-800` | `#071f90` | `#071f90` | same |
| `brand-900` | `#06186f` | `#06186f` | same |
| `brand-950` | `#05104b` | `#05104b` | same |

### Tones

| token | web light | web dark | app |
| --- | --- | --- | --- |
| `success` | `#137a4c` | `#5ec98f` | same |
| `success-soft` | `#e2f3ea` | `#12251c` | same |
| `warn` | `#9a6100` | `#e0aa53` | same |
| `warn-soft` | `#fdf1dc` | `#2a2114` | same |
| `danger` | `#b3261e` | `#f08a80` | same |
| `danger-strong` | `#8c1e17` | `#f5a9a1` | same |
| `danger-soft` | `#fbe9e7` | `#2d1917` | same |
| `info` | `#0b5f7a` | `#63b7d1` | same |
| `info-soft` | `#e2f1f6` | `#12242a` | same |
| `neutral` | `#5b6472` | `#a3adba` | same |
| `neutral-soft` | `#eceef2` | `#232a33` | same |

### Shell — the dashboard's sidebar

| token | web light | web dark | app |
| --- | --- | --- | --- |
| `shell` | `#000000` | `#000000` | — *web only* |
| `shell-line` | `#1b1b22` | `#1b1b22` | — *web only* |
| `shell-ink` | `#c6cce3` | `#c6cce3` | — *web only* |
| `shell-ink-muted` | `#8f97b4` | `#8f97b4` | — *web only* |

### Charts

| token | web light | web dark | app |
| --- | --- | --- | --- |
| `chart-series-1` | `#0a31e3` | `#768cef` | same |
| `chart-series-2` | `#8c8f10` | `#ced218` | same |
| `chart-single` | `#0a31e3` | `#768cef` | same |
| `chart-track` | `#eceff3` | `#232c36` | `#e8ebef` / `#242b35` |
| `chart-grid` | `#eceff3` | `#232c36` | `#e8ebef` / `#242b35` |
| `chart-axis` | `#98a2b3` | `#6d7986` | `#8b95a3` / `#75808e` |

### Severity — the PAR ramp

| token | web light | web dark | app |
| --- | --- | --- | --- |
| `severity-good` | `#0ca30c` | `#0ca30c` | same |
| `severity-warning` | `#c58704` | `#c58704` | same |
| `severity-serious` | `#e97041` | `#e97041` | same |
| `severity-critical` | `#d03b3b` | `#d03b3b` | same |

### Type

| role | web | app | weight |
| --- | --- | --- | --- |
| `figure` | 36 / 40 | 28 / 34 | 600 |
| `title` | 24 / 32 | 20 / 26 | 600 |
| `heading` | 18 / 28 | 17 / 22 | 600 |
| `body` | 14 / 20 | 16 / 22 | 400 |
| `body-strong` | 14 / 20 | 16 / 22 | 600 |
| `label` | 12 / 16 | 13 / 18 | 500 |
| `caption` | 12 / 16 | 13 / 18 | 400 |
| `mono` | 13 / 18 | 15 / 20 | 500 |

Set in **Manrope**, with **IBM Plex Mono** for the `mono`
role, at weights 400 / 500 / 600.

### Spacing, radii, targets

`space.xs` 4 · `space.sm` 8 · `space.md` 12 · `space.lg` 16 · `space.xl` 24 · `space.xxl` 32

`radius.sm` 6 · `radius.md` 10 · `radius.lg` 14 · `radius.pill` 999

`tapTarget` 48 — 44 is Apple's floor and 48dp is Android's. Taking the larger costs nothing, and both products are used one-handed, outdoors, at speed.

---

## Why these values

**`background`** — The page behind everything. On the web this was called surface-sunken, which named the wrong thing: a page is not a well.

**`surface`** — A card on the page. On the web this was surface-raised.

**`surface-inset`** — A field or a well inside a card. The two platforms run this in opposite directions in dark mode — the dashboard recesses a text input below its card, the app raises a row above it — and that is a real design difference rather than drift, so it is carried rather than averaged.

**`surface-pressed`** — Pressed or hovered. The app had it as a token; the dashboard spelled it inline as hover:bg-surface-sunken, which is the page colour standing in for a state.

**`line`** — A hairline. Named `line` and not `border` because the web generates a utility from it and `border-border` is not a name anybody should have to type; the app's JS key reads the same either way, so the platform with the constraint decides.

**`ink`** — Body text. `ink` and not `text` for the same reason as `line`: --text-* is Tailwind's namespace for font sizes, so a colour called text-muted would sit three lines from a size called caption and the first one moved into @theme by mistake would declare a font size called muted.

**`ink-subtle`** — The faintest step, and the one with no contrast budget left. It carries the eyebrow over a figure and the header of a table — small text set in caps — so WCAG asks 4.5 of it and it does not deliver: the web shipped #98a2b3, which is 2.58 on a white card. Darkened here to 3.06, which is what the app and both dark modes already manage. It is not taken to 4.5 because at 4.5 on white it is #69778f against ink-muted's #667085 and the third step stops existing. Collapsing three text greys into two is a design decision rather than a token nudge; see docs/open-questions.md.

**`ink-inverse`** — Text on a filled brand or danger surface.

**`brand-yellow`** — The arrows, as supplied. 12.86 on black and 1.63 on white, so it can carry a dark ground and can never be text or a fill on a light one. Deliberately not the accent anywhere else in either product: amber already means `behind, not yet serious` in the PAR ramp, and a yellow control would be the overdue colour pointing at whatever is on screen.

**`brand-yellow-ink`** — The same yellow taken down until it clears 3:1 on white.

**`brand`** — The accent, as opposed to the eleven-step ramp. Mode-aware, because the ramp is not: #0a31e3 is 8.20 on white and 2.04 against a dark card, so a filled button in dark mode reads as a hole rather than a control. The dark step is brand-400, which is where the chart series already goes for the same reason.

**`brand-strong`** — Hover and press for anything filled with `brand`.

**`brand-soft`** — The ground under a brand-toned badge or icon chip.

**`danger-strong`** — Hover and press for a destructive button, which is the only filled danger surface in either product.

**`overlay`** — The scrim behind the offline / stale-data banner.
