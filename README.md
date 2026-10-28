# Mary Jane Dela Cruz — Graphic Artist

**Live:** https://mj-delacruz.github.io/

Portfolio site. Graphic artist in Mandaue City, Cebu — custom motorcycle decals,
vehicle graphics, die-cut stickers and pattern making on Graphtec plotters.

The whole page is a small 3D studio built with Three.js: a cutting plotter that
cuts stickers on a loop, a design desk, a vinyl rack, and her real work framed on
the walls. Plain HTML, CSS and JavaScript — no framework and no build step, which
is exactly what GitHub Pages is good at. Three.js loads from jsDelivr.

## Getting around

| Hotspot | Opens |
|---|---|
| Desk and monitor | About |
| Plotter | Services |
| Wall frames | Portfolio (clicking a frame opens that piece) |
| Neon sign | Contact |

The dock at the bottom opens the same panels, and each panel has its own URL
(`#about`, `#services`, `#work`, `#contact`). Drag to orbit; scroll or pinch to zoom.

## Design

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#fdfdfd` | Panels |
| `--blush` | `#fec7ca` | Tints, soft type on black |
| `--coral` | `#fd8f96` | The cut line — primary accent |
| `--rose`  | `#7f484b` | Deep accent, labels |
| `--ink`   | `#000000` | Buttons, intro ground |

Type: **Bricolage Grotesque** (display), **Instrument Sans** (body),
**Martian Mono** (labels).

## Files

| File | Contents |
|---|---|
| `index.html` | Page shell — intro, brand, dock, drawer, lightbox |
| `assets/css/style.css` | Tokens and all styles |
| `assets/js/site.js` | Panel content, the `WORK` list, drawer, lightbox, intro |
| `assets/js/room.js` | The 3D studio, camera moves, pins and hover |
| `assets/img/works/` | Full-size portfolio images (max 1400px) |
| `assets/img/thumbs/` | 640px versions, used for the grid and the wall frames |
| `404.html` | Uses absolute paths, so it serves at any depth |

`site.js` runs on its own. If WebGL or the CDN fails, the room is replaced by her
portrait and every panel still opens from the dock.

## The intro

A die-cut sticker: the blade traces the contour, the sticker fills with her name,
then it peels away while the studio builds itself behind it. It plays once per
browser session, is skippable (button, `Esc`, `Space`, `Enter`, or a click), and
never plays under `prefers-reduced-motion: reduce`.

## Adding portfolio pieces

1. Export two JPEGs with the same name: a full-size one (about 1400px on the long
   side) into `assets/img/works/`, and a 640px one into `assets/img/thumbs/`.
2. Add an entry to the `WORK` list in `assets/js/site.js`, with the thumb's size:

```js
{ file: "moto-new-kit", cat: "decals", title: "New body kit", w: 640, h: 300 },
```

Categories are the `CATS` list just above it. To hang a piece on the studio wall,
add a `frame(...)` line in `assets/js/room.js`.

## Local preview

`room.js` is an ES module, so open the site through a server, not `file://`:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Settings → Pages → Source: **Deploy from a branch** → `main` / `/ (root)`.
Push, and the site updates in about a minute.
