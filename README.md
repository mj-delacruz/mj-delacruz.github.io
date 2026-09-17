# Mary Jane Dela Cruz — Graphic Artist

**Live:** https://mj-delacruz.github.io/

Portfolio site. Graphic artist in Mandaue City, Cebu — custom motorcycle decals,
vehicle graphics, die-cut stickers and pattern making on Graphtec plotters.

Plain HTML and CSS, one page, no framework and no build step — which is exactly
what GitHub Pages is good at.

## Design

The visual system is built from the vocabulary of a cutting plotter, because that
is what the work actually is: dashed **contour paths** offset from an edge,
**registration crosshairs** on the service cards, a **nesting grid** behind the
hero, and a diagonal **weeding hatch** standing in for portfolio images.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#fdfdfd` | Page ground (light) |
| `--blush` | `#fec7ca` | Tints, soft type on black |
| `--coral` | `#fd8f96` | The cut line — primary accent |
| `--rose`  | `#7f484b` | Deep accent, rules, headings |
| `--ink`   | `#000000` | Hero, contact and footer ground |

Neutrals are biased toward rose rather than pure grey. Both light and dark themes
are defined token-level at the top of `assets/css/style.css`; the toggle in the
header persists to `localStorage`, and with no stored choice the OS decides.

Type: **Bricolage Grotesque** (display), **Instrument Sans** (body),
**Martian Mono** (labels and readouts).

## Files

| File | Contents |
|---|---|
| `index.html` | The whole site — hero, about, services, portfolio, contact |
| `assets/css/style.css` | Tokens, layout, and the intro styles at the bottom |
| `assets/js/intro.js` | The orbit intro sequence |
| `assets/js/site.js` | Nav, theme, reveals, ticker, portfolio tiles |
| `404.html` | Uses absolute paths, so it serves at any depth |

## The intro

It is a loading beat that becomes the page. Four tool marks orbit a sphere that
grows from a dot; the spin eases to zero, the marks snap into a centred row, the
name resolves — and then the whole arrangement flies into the hero standing behind
it: marks left into `#toolstrip`, sphere right into `#heroshot`, morphing from a
circle into the portrait frame while the photo cross-fades in.

The flying pieces are **clones of the real hero elements**, so the marks have one
source of truth — the `.tool` markup in `index.html`. Add or remove one there and
the intro follows; the alignment maths is written for any `N`.

- Plays on **every visit**, since it doubles as the page reveal.
- Skippable — the Skip button, `Esc`, `Space`, `Enter`, or a click on the backdrop.
  Skipping jumps straight to the settled hero.
- Never plays under `prefers-reduced-motion: reduce`.
- Built entirely in `intro.js`, so with JavaScript off you simply get the hero.

Timings are the `SEQ` object at the top of `assets/js/intro.js` — `grow`, `align`,
`text`, `hold`, `settle`, in milliseconds.

### How the handover works

`<html>` carries the state, set by an inline script **before first paint** so the
hero never flashes past:

| Class | Meaning |
|---|---|
| `intro-run` | Overlay is up. Header, ticker and hero copy hidden, scroll locked. |
| `intro-landing` | Backdrop has cleared, but the real marks and photo stay hidden — the flying copies have not landed yet. |
| `intro-settle` | Finished. Everything visible; this one stays for good. |

An inline failsafe clears `intro-run` after five seconds if `intro.js` never loads,
so a blocked script can never leave the hero invisible.

## Adding portfolio images

1. Drop the file into `assets/img/work/`.
2. Add an `img` key to that entry in the `WORK` list in `assets/js/site.js`:

```js
{ tag: "Motorcycle", cap: "Custom body skin, full wrap", img: "bike-01.jpg" },
```

Entries without an `img` render the hatch placeholder, so the grid is never broken
while the photos are still coming.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`.
Push, and the site updates in about a minute.
