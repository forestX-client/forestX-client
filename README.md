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

## Built into the client (not a separate launcher)

`forestx.html`'s **own** HTML shell is patched in place — there is no
separate launcher screen layered on top:

1. **Its own loading screen** (`#lx-boot`, the one already in the file with
   real progress from the game's boot stages) is reworked into a tranquil
   animated forest with the ForestX Client title and segmented progress
   bar — plus the username field right on the hill. Type your name while
   it loads; when it's done the loader fades by itself into the game's
   own title screen. Nothing to click through.
2. **Its own ForestX panel** (`Esc` → `F8`) gains a **▶ Play** tab:
   username (same one from the loader, saved in the client's own settings
   store and copied for the game's profile prompt), **UNO · Singleplayer**,
   **DOS · Multiplayer**, **⚙ Settings**, and saved `wss://` servers
   (Join copies the address for in-game paste — the game draws its menus
   on canvas, so its own Singleplayer/Multiplayer buttons are the ones
   that actually start a game).

Everything before `<body>` except the asset pack below — WASM, the shell
loader, the whole game code — is byte-identical to the fetched file
(asserted by the patcher). Only the client's body shell (boot screen +
F8 panel) changes: +132/−29 lines. `tools/patch_client.py` applies the
patch with exact anchors and aborts untouched if any anchor doesn't
match exactly once.

3. **The game's own title screen** — the embedded `assets.epk` is unpacked
   (classic Eaglercraft EPK ver2.0), edited, rebuilt and re-embedded by
   `tools/patch_assets.py`: the canvas menu's real buttons become
   **Uno – Singleplayer**, **Dos – Multiplayer** and **Settings** (via
   `menu.singleplayer/multiplayer/options` in the language files), the
   Options screen is titled Settings, splashes are ForestX-flavoured,
   and the six panorama textures are regraded from purple to a tranquil
   green forest. Every entry's CRC32 is recomputed and the rebuilt pack
   is re-parsed and diffed — exactly the intended entries change.

## Files

```
index.html            Landing page (one Play button, one Download button)
forestx.html          THE CLIENT — engine, assets, sounds, WASM, one file (shell patched, see above)
styles.css            Landing page styling
tools/
  patch_client.py     Applies the in-client UI patch (idempotent, anchor-checked)
  patch_assets.py     Rebrands the game's title screen inside assets.epk (needs Pillow)
assets/
  hero-world.jpg      Voxel forest artwork
  favicon.svg         Grass-block favicon
.github/workflows/
  fetch-client.yml    Re-fetch forestx.html from v0-forestx.vercel.app + re-apply the patch
```

## Updating the client

When a new build is published at `v0-forestx.vercel.app`:

- **Actions tab → “Fetch ForestX client” → Run workflow** — downloads the new
  client, re-applies `tools/patch_client.py`, and commits, or
- replace `forestx.html` manually, then run `python3 tools/patch_client.py`.

Recover the pristine unpatched client any time with
`git show 95207d1:forestx.html > forestx.html`.

## Disclaimer

ForestX is a fan-made browser client project. Not an official Minecraft product —
not affiliated with, endorsed by, or approved by Mojang or Microsoft.
"Minecraft" is a trademark of Mojang AB.
