# 🌲 ForestX

**A full Eaglercraft-style Minecraft experience packed into one HTML file.**

This repo hosts the ForestX landing page. Play the client right in your browser,
or download the single self-contained file and run it anywhere — even offline.

| | |
|---|---|
| ▶ **Play online** | https://v0-forestx.vercel.app/play |
| ↓ **Download client** | https://v0-forestx.vercel.app/forestx.html (~86 MB, one file) |

## Why ForestX

- **Instant play** — no installs, no accounts, no setup
- **One single file** — engine, assets, sounds and WASM bundled into `forestx.html`
- **Multiplayer ready** — connect to Eaglercraft-compatible WebSocket (`wss://`) servers
- **Works offline** — save it to USB / desktop / school folder and double-click
- **Full game feel** — survival & creative, worlds saved in your browser
- **ForestX menu** — press `Esc`, then `F8` in-game for Look · HUD · Tools

## This landing page

Plain static HTML/CSS/JS — no build step. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Deploy anywhere static: GitHub Pages (Settings → Pages → deploy from branch, root), Vercel, Netlify, etc.

### Files

```
index.html          Landing page
styles.css          Minecraft-flavoured styling, day/night themes
script.js           Particles, mining playground, live keyboard, FAQ, counters
assets/
  hero-world.jpg    Voxel forest artwork (hero)
  cave-world.jpg    Voxel cave artwork (showcase)
  favicon.svg       Grass-block favicon
```

Highlights: animated in-game HUD hero, a playable "mine the blocks" playground
with inventory & levels, a keyboard that lights up as you type, live-looking
server list, day/night toggle, and a download card wired to the real client file.

## Disclaimer

ForestX is a fan-made browser client project. Not an official Minecraft product —
not affiliated with, endorsed by, or approved by Mojang or Microsoft.
"Minecraft" is a trademark of Mojang AB.
