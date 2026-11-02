# 🌲 ForestX

**A full Eaglercraft-style Minecraft experience packed into one HTML file.**

This repo is the ForestX landing page. Play the client in your browser, or
download the single self-contained file and run it anywhere — even offline.

| | |
|---|---|
| ▶ **Play** | [`play.html`](play.html) — embeds the live client |
| ↓ **Download client** | https://v0-forestx.vercel.app/forestx.html (~86 MB, one file) |
| 🌐 **Live client** | https://v0-forestx.vercel.app/play |

## Run the landing page

No build step, no JavaScript dependencies — plain static files:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Deploy anywhere static: GitHub Pages (Settings → Pages → deploy from branch, root), Vercel, Netlify, etc.

## Files

```
index.html          Landing page — one Play button, one Download button
play.html           Fullscreen embed of the live client (v0-forestx.vercel.app/play)
styles.css          All styling for both pages
assets/
  hero-world.jpg    Voxel forest artwork
  favicon.svg       Grass-block favicon
```

The Play button links **same-tab** to `play.html` on purpose: `target="_blank"`
links to the client get swallowed by popup blockers and embedded previews,
making Play look broken. An internal page can't be blocked that way, and
`play.html` includes a direct-open/download fallback if a browser or network
blocks the embed.

## Disclaimer

ForestX is a fan-made browser client project. Not an official Minecraft product —
not affiliated with, endorsed by, or approved by Mojang or Microsoft.
"Minecraft" is a trademark of Mojang AB.
