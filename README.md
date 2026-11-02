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

## Files

```
index.html            Landing page (one Play button, one Download button)
forestx.html          THE CLIENT — engine, assets, sounds, WASM in one file
styles.css            Landing page styling
assets/
  hero-world.jpg      Voxel forest artwork
  favicon.svg         Grass-block favicon
.github/workflows/
  fetch-client.yml    Re-fetch the latest forestx.html from v0-forestx.vercel.app
```

## Updating the client

When a new build is published at `v0-forestx.vercel.app`, update the copy in
this repo either way:

- **Actions tab → “Fetch ForestX client” → Run workflow** (downloads and commits it), or
- replace `forestx.html` manually and commit.

## Disclaimer

ForestX is a fan-made browser client project. Not an official Minecraft product —
not affiliated with, endorsed by, or approved by Mojang or Microsoft.
"Minecraft" is a trademark of Mojang AB.
