# The catalogue

What each thing is, what it means, and what it is called on both platforms.

This exists because the two products already had a design system — they just had
it twice, under different names, and neither side could see the other's. Nine
components share a name across the repos today and six more are the same idea
with different ones. The table below is the agreed landing; the **web** and
**app** columns say where each side stands against it.

A note on how to read the "same" rows: they are not the interesting ones. They
are here so that somebody adding a seventh badge can see that `Badge` already
exists on both sides and means a short fixed-vocabulary status, rather than
inventing `Chip`.

---

## Status and messaging

| concept | agreed name | web | app |
| --- | --- | --- | --- |
| a short status word from a fixed vocabulary | `Badge` | `Badge` ✓ | `Badge` ✓ |
| an inline message about the thing on screen | `Alert` | `Alert` ✓ | `Banner`, `Problem`, `HorizonNotice`, `SuccessNotice`, `QueuedNotice` → collapse into one with a `tone` |
| the screen has nothing to show | `EmptyState` | `EmptyState` ✓ | `EmptyState` ✓ |

The app's five message components are one component with five tones. They
diverged because each was written where it was first needed; the dashboard's
`Alert` already takes `tone`, and the tones already mean the same thing in both
products — brand for *in progress and healthy*, success for *closed*, warn for
*waiting on someone*, danger for *money is at risk*, neutral for *no longer
live*.

## Numbers

| concept | agreed name | web | app |
| --- | --- | --- | --- |
| a label above a number | `Stat` | `Stat` ✓ | `Stat`, `StatTile`, `StatGrid` |
| a stacked bar of severity bands | `SeverityBar` | `SeverityBar` ✓ | `StackedBar`, `Meter`, `Bar` |
| a ranked list with bars | `BarList` | `BarList` ✓ | — |
| a score on a dial | `ScoreDial` | `ScoreDial` ✓ | — |

**`Figure` became `Stat`,** and this was a correction to the type work rather
than a preference. That phase renamed the *type role* `display` → `figure`, because
what the largest size holds in this product is a number rather than display
text. Leaving the component called `Figure` then meant one word naming both the
size and the thing — and the component does not always render at that size: it
picks `figure` when it is the lead number on a screen and `title` otherwise.
`Stat` is what the app already calls it and it frees `figure` to mean exactly one
thing.

The component chooses its own size from the room it is given. That rule is
shared: the app's `Stat` renders its value as `Title` across a full row and
`Heading` in half of one; the web's takes a `lead` boolean that sets both the
grid span and the role.

## Records

| concept | agreed name | web | app |
| --- | --- | --- | --- |
| a label and its value | `DetailRow` | inside `DetailList` | `DetailRow` ✓ |
| a card | `Card` | `Card` ✓ | `Card` ✓ |
| a row in a list that opens something | `ListRow` | — *(rows are table cells)* | `ListRow` ✓ |
| a table of records | `DataTable` | `DataTable` ✓ | — *(the app stacks `ListRow`)* |

`DetailRow` wins over `KeyValueList` because it names one row rather than the
container, and because "key" is a word these codebases already use for catalogue
keys and API identifiers. The web's container is `DetailList`, which lays the
rows out in a grid and does not export the row itself — nothing there needs one
on its own yet. Extracting it is a change worth making the day something does,
and not before.

`FieldRow` on the web is **not** this. It is a form-layout grid that puts two or
three fields on a line, which the app has no equivalent of because it stacks. It
keeps its name; the resemblance is in the word `Row` and nowhere else.

## Input

| concept | agreed name | web | app |
| --- | --- | --- | --- |
| a labelled field wrapper | `Field` | `Field` ✓ | `Field` ✓ |
| the bare control | `Input` | `Input` ✓ | — *(no bare control)* |
| a labelled single-line text field | — *(composed at the call site)* | `Field` + `Input` | `TextField` ✓ |
| a choice from a closed list | `Select` | `Select` ✓ | `Select` ✓ |
| a phone number | `PhoneField` | `PhoneField` ✓ | `PhoneField` ✓ |
| an amount of money | `AmountField` | — *(spelled inline)* | `AmountField` ✓ |
| a date | `DateField` | — *(native `date` input)* | `DateField` ✓ |
| search | `SearchInput` | `SearchInput` ✓ | `SearchInput` ✓ |

**`Input` and `TextField` are different components and both keep their names.**
This table said "`TextField` → rename" until somebody opened the two files, on
the reasoning that `Field` was already the wrapper so `TextField` read as a
second one. That reasoning had it backwards.

The web's `Input` is a bare `<input>` wearing the control classes: no label, no
hint, no error, and a call site composes it inside a `Field`. The app's
`TextField` *is* that composition — it renders a `Field` around a `TextInput` —
and adds three things the web has no equivalent of: the focus report that keeps
a field above the keyboard, the reveal toggle on a password, and a suffix for a
currency unit. Renaming it to `Input` would have put one name on two different
components, which is what this catalogue exists to prevent.

The split under `Field` is the platforms differing, not the names drifting. The
web associates a `<label htmlFor>` with a control, so it composes; React Native
has no such association, so it hands out one component per input kind. That is
why the app has a `*Field` family and the web does not, and why collapsing one
member of it would have cost the app the only naming symmetry its form layer
has.

This is the `FieldRow` mistake a second time, and it is the same tell both
times: a shared word, checked against nothing.

## Navigation and filtering

| concept | agreed name | web | app |
| --- | --- | --- | --- |
| a row of filter chips | `FilterPills` | `FilterPills` ✓ | `FilterPills` ✓ |
| a horizon chooser (today / month end / 30 / 90) | `HorizonPills` | *(`FilterPills` with horizon options)* | `HorizonPills` ✓ |
| moving between pages of results | `Pager` | `Pager` ✓ | — |
| appending the next page of results | `LoadMore` | — | `LoadMore` ✓ |

**`Pager` and `LoadMore` stay apart deliberately.** They are not the same control
in two dialects: a pager moves between pages and a load-more appends to a list.
Giving two behaviours one name would be the mirror of the problem this catalogue
is fixing. They differ because a mouse and a thumb want different things, and
that is a real reason.

## Type

Eight roles, named the same on both platforms, sized differently on purpose —
14px on a desk and 16px at arm's length outdoors are the same decision made twice
for different distances. The values are in [tokens.md](tokens.md).

| role | holds |
| --- | --- |
| `figure` | the one number a screen is about |
| `title` | a page title, and every stat that is not the lead one |
| `heading` | a section heading inside a page |
| `body` | running text, table cells, everything unremarkable |
| `body-strong` | body text that is the answer rather than the surroundings |
| `label` | the name of a thing: field labels, eyebrows over a figure |
| `caption` | an aside under something else: hints, counts, timestamps |
| `mono` | a reference, code or account number read character by character |

On the web a role is a single class — `text-body`, `text-label` — carrying size,
leading and weight together, because a size without a weight is not a decision
anybody made. On the app each is a component in `ui/Text.tsx`.

**A role is one weight, and the role carries it.** `label` is where this had to
be settled: the web had twelve eyebrows written `text-label font-semibold` and
ten written plain, the same uppercase grey caption over a figure either way,
while the app's `Label` had no override anywhere. The app's reading won, so the
web dropped the twelve rather than the app gaining a thirteenth spelling — a
role that means 500 on one platform and 600 on the other is two roles sharing a
name. `lib/type-scale.test.ts` in the dashboard holds the line and counts the
three places still allowed to say a weight beside `text-label`, none of which
is a label: they borrow the role's size for initials in an avatar and a control
in the dark shell.

`mono` is the one that is spelled differently by necessity: on the web it is a
custom utility that includes the family, because splitting it would mean writing
`font-mono text-mono` at every site.

---

## What this is not, yet

No rendered examples. A page per platform generated from the components
themselves would carry most of the remaining value, and Storybook is the obvious
tool and the heaviest one. Worth doing once the renames above have actually
landed on both sides — a catalogue of names that disagree with the code is worse
than no catalogue, which is how this situation arose in the first place.
