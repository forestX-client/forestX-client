# 🌲 ForestX

**A full Eaglercraft-style Minecraft experience packed into one HTML file.**

This repo hosts the ForestX landing page **and the client itself**
(`forestx.html`, fetched from https://v0-forestx.vercel.app/forestx.html).
No iframes, no external dependencies: Play opens the actual file,
Download saves the same file.

| | |
|---|---|
| ▶ **Play** | [`forestx.html`](forestx.html) |
| ↓ **Download client** | Same `forestx.html` (~87 MB, one self-contained file) |

## Run it

No build step — plain static files:

```bash
python3 -m http.server 8000
# Landing:  http://localhost:8000
# Client:   http://localhost:8000/forestx.html
```

Deploy anywhere static: GitHub Pages (Settings → Pages → deploy from branch, root), Vercel, Netlify, etc.

## The ForestX launcher (inside `forestx.html`)

Booting the client now runs a custom experience, all inside the same file:

1. **Tranquil forest loading** — animated dawn forest, real progress bar
   driven by the game's own boot stages (`BOOTSTAGE` / `__eaglerGameReady`)
2. **The hill** — type your username (pixel avatar generated from it, saved locally)
3. **ForestX Client menu** — **UNO** Singleplayer · **DOS** Multiplayer
   (saved `wss://` servers, address copied for in-game paste) · **Settings**
   (ambience, motion, particles, boot-performance flags)

It sits on top of the client while the game boots underneath; the existing
ForestX overlay (F8 menu, HUD, tools) is untouched. In game, a tiny
grass-block button (bottom-right) reopens the launcher.

Implementation: `launcher/forestx-launcher.snippet.html` is injected as one
marked block after `<body>` by `tools/inject_launcher.py`. Removing the block
reproduces the pristine downloaded client **byte-for-byte** — nothing in the
game itself is modified. The launcher hides itself automatically if it ever
errors, so it can never trap the game behind it.

## Files

```
index.html            Landing page (one Play button, one Download button)
forestx.html          THE CLIENT — engine, assets, sounds, WASM + launcher, one file
styles.css            Landing page styling
launcher/
  forestx-launcher.snippet.html   Launcher source (edit this, then re-inject)
tools/
  inject_launcher.py              Injects/replaces the launcher block
assets/
  hero-world.jpg      Voxel forest artwork
  favicon.svg         Grass-block favicon
.github/workflows/
  fetch-client.yml    Re-fetch forestx.html from v0-forestx.vercel.app + re-inject launcher
```

## Updating the client

When a new build is published at `v0-forestx.vercel.app`:

- **Actions tab → “Fetch ForestX client” → Run workflow** — downloads the new
  client, re-injects the launcher, and commits, or
- replace `forestx.html` manually, then run `python3 tools/inject_launcher.py`.

## Updating the launcher

Edit `launcher/forestx-launcher.snippet.html`, run
`python3 tools/inject_launcher.py` (idempotent), reload the client.

## Disclaimer

ForestX is a fan-made browser client project. Not an official Minecraft product —
not affiliated with, endorsed by, or approved by Mojang or Microsoft.
"Minecraft" is a trademark of Mojang AB.
