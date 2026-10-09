# Open questions

Things the token source knows are unresolved. Each one is here because it is a
decision somebody should make rather than a value somebody should nudge.

## The third text grey does not clear 4.5 on white

`ink-subtle` carries the eyebrow over a figure and the header of a table — small
text, set in caps. WCAG asks 4.5:1 of it. It ships at **3.06** on a white card,
up from 2.58, and the reason it stopped there is arithmetic rather than
appetite:

| | web light | ratio on a white card |
| --- | --- | --- |
| `ink` | `#101828` | 17.75 |
| `ink-muted` | `#667085` | 4.97 |
| `ink-subtle` *(today)* | `#8994a8` | 3.06 |
| `ink-subtle` *(at 4.5)* | `#69778f` | 4.53 |

At 4.5 the third step lands on top of the second and stops being a step. White
simply does not afford three well-separated greys above 4.5, and dark mode does
not have the problem — it runs 14.4 / 6.6 / 3.8 with room to spare.

So the question is not which hex code. It is whether the light palette should
have **two** text greys and a third colour reserved for non-text — rules, icons,
disabled glyphs — which is what most systems that face this settle on. That
changes which component uses which, so it is a design decision with a refactor
behind it.

Floored at 3.0 by `test/contrast.test.mjs` in the meantime, so it cannot get
worse while nobody is looking.

## `surface-inset` runs in opposite directions

The dashboard recesses a text input *below* its card in dark mode
(`#10151a` under `#171d24`); the app raises a row inside a card *above* it
(`#1f252e` over `#171c23`). Both are defensible and they are not the same idea
wearing one name:

- the web's inset is a **field** — somewhere you type, which reads as a well
- the app's is a **row** — a band inside a card, which reads as a shelf

Carried per-platform rather than averaged, because averaging would restyle one
of the two apps to make a table look tidier. Worth revisiting if the app grows
real text fields inside cards, at which point it will need both and the name
will have to split.

## The app has no severity ramp

`severity-*` is web-only. The app renders arrears without one — a loan is late or
it is not — where the dashboard draws the PAR 10/20/30 bands as a stacked bar.
That is a gap rather than a decision: a field officer looking at a retailer's
history has the same question as an analyst looking at the book.

Shipped in the shared source so the app can take it without a second argument
about colour.

[catalogue.md](catalogue.md) disagreed with this section for two revisions,
listing the app's `StackedBar`, `Meter` and `Bar` against `SeverityBar` as
though the ramp existed there under three names. It does not: those are two
named series in one bar, a single proportion, and a ranked comparison. The row
is fixed, and the gap is still a gap — a component to write, with its tokens
already in the package.

## Nothing here describes motion or elevation

Both apps have shadows and transitions, spelled inline on both sides. They are
tokens in every mature system and they are not tokens here, because neither app
has enough of them yet for the drift to be visible. Add them when somebody has to
ask "which shadow" twice.
