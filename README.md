# 🌲 ForestX

**A full Eaglercraft-style Minecraft experience packed into one HTML file.**

This repo is the ForestX landing page. Play the client in your browser, or
download the single self-contained file and run it anywhere — even offline.

| | |
|---|---|
| ▶ **Play** | https://v0-forestx.vercel.app/play |
| ↓ **Download client** | https://v0-forestx.vercel.app/forestx.html (~86 MB, one file) |

The Play and Download buttons link directly to the live client — no iframes,
no wrapper pages. Links are same-tab on purpose: `target="_blank"` gets
swallowed by popup blockers and embedded previews, which made Play look broken.

## Run the landing page

No build step, no JavaScript — plain static files:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Deploy anywhere static: GitHub Pages (Settings → Pages → deploy from branch, root), Vercel, Netlify, etc.

## Files

```
index.html          The whole landing page (one Play button, one Download button)
styles.css          All styling
assets/
  hero-world.jpg    Voxel forest artwork
  favicon.svg       Grass-block favicon
```

> Want the client self-hosted from this repo instead of linking to Vercel?
> Drop `forestx.html` in the root and point the two links in `index.html`
> at `./forestx.html` / a local play route.

## Disclaimer

ForestX is a fan-made browser client project. Not an official Minecraft product —
not affiliated with, endorsed by, or approved by Mojang or Microsoft.
"Minecraft" is a trademark of Mojang AB.
