# ForestX Client

**Minimalist. Packed with function.**

ForestX is a browser-based EaglercraftX 26.3 (Wasm-GC) client with a built-in
control panel, a real performance HUD, and a small set of quality-of-life tools.
No install. No account. No cheats.

## The landing page

The landing page is [`index.html`](index.html). It is a single static page with
no dependencies:

- a live, interactive ForestX panel demo (Look / HUD / Tools) on a pixel forest
  and a cave scene;
- a feature grid, performance chart, keyboard map, and FAQ;
- responsive layout and reduced-motion support.

The demo is vanilla JS in [`assets/app.js`](assets/app.js). Styles are in
[`assets/styles.css`](assets/styles.css).

## Launch the client

The client is split into four parts in [`client/parts/`](client/parts). The
launcher at [`client.html`](client.html) fetches the parts in order,
concatenates them in the browser, and opens the assembled client. Nothing is
uploaded.

See [`client/README.md`](client/README.md) for the assembly order and the
optional server-side build.

## Development

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173/>.

Build a single client file (optional, for local testing):

```bash
node scripts/build-client.mjs
```

This writes `client/forestx.html`, which is gitignored.

## Keys

| Key | Action |
| --- | --- |
| `F8` | Open / close the ForestX panel |
| `F9` | Toggle zoom |
| `F7` | Toggle the HUD overlay |
| `Esc` | Close the panel / pause |

## Disclaimer

Not affiliated with Mojang, Microsoft, or Eaglercraft. No cheats, just frames.
