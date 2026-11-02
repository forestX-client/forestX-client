/* ============================================================
   ForestX Client — landing page interactions
   Vanilla JS. No dependencies. No tracking.
   ============================================================ */
(() => {
  'use strict';

  /* ---------- tiny helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const pad = n => String(n).padStart(2, '0');
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');

  const store = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch { /* private mode */ }
    }
  };

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  /* ---------- scene artwork ---------- */
  function tree(x, y, s, dark) {
    const leafA = dark ? '#1d5128' : '#2f7a36';
    const leafB = dark ? '#246b30' : '#3f9e44';
    const leafC = dark ? '#2a7a36' : '#4fbf55';
    const leafD = dark ? '#2f8a3a' : '#5fd068';
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <rect x="-5" y="-62" width="10" height="62" fill="#4a3524"/>
      <rect x="-5" y="-62" width="4" height="62" fill="#5c4530"/>
      <rect x="-30" y="-100" width="60" height="20" fill="${leafA}"/>
      <rect x="-40" y="-80" width="80" height="20" fill="${leafB}"/>
      <rect x="-30" y="-60" width="60" height="20" fill="${leafA}"/>
      <rect x="-20" y="-120" width="40" height="20" fill="${leafC}"/>
      <rect x="-10" y="-140" width="20" height="20" fill="${leafD}"/>
      <rect x="-34" y="-96" width="10" height="6" fill="${leafD}" opacity=".55"/>
      <rect x="18" y="-76" width="12" height="6" fill="${leafD}" opacity=".45"/>
    </g>`;
  }

  function forestScene() {
    return `<svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A pixel forest at dusk">
      <defs>
        <linearGradient id="fxSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0a1a24"/><stop offset=".55" stop-color="#173a35"/><stop offset="1" stop-color="#2d5a3f"/>
        </linearGradient>
        <linearGradient id="fxWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2a6a7a"/><stop offset="1" stop-color="#123a44"/>
        </linearGradient>
        <radialGradient id="fxMoon"><stop offset="0" stop-color="#d9f7c4" stop-opacity=".38"/><stop offset="1" stop-color="#d9f7c4" stop-opacity="0"/></radialGradient>
        <pattern id="fxGrass" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#3a2a1c"/>
          <rect width="40" height="12" fill="#4f9e3f"/>
          <rect width="40" height="4" fill="#6ec44f"/>
          <rect y="12" width="40" height="3" fill="#2f6a2a"/>
          <rect x="8" y="22" width="6" height="6" fill="#2a1e14"/>
          <rect x="26" y="30" width="8" height="5" fill="#2a1e14"/>
        </pattern>
      </defs>
      <rect width="800" height="520" fill="url(#fxSky)"/>
      <circle cx="300" cy="92" r="86" fill="url(#fxMoon)"/>
      <circle cx="300" cy="92" r="27" fill="#d9f7c4"/>
      <circle cx="291" cy="84" r="5" fill="#c3e6ad" opacity=".6"/>
      <circle cx="310" cy="101" r="3" fill="#c3e6ad" opacity=".5"/>
      <g fill="#d9f7c4" opacity=".65">
        <circle cx="80" cy="52" r="1.6"/><circle cx="150" cy="88" r="1.1"/><circle cx="230" cy="44" r="1.4"/>
        <circle cx="310" cy="76" r="1"/><circle cx="390" cy="38" r="1.5"/><circle cx="470" cy="92" r="1.1"/>
        <circle cx="140" cy="48" r="1.3"/><circle cx="200" cy="60" r="1.2"/><circle cx="260" cy="130" r="1"/>
      </g>
      <g fill="#9fc4b0" opacity=".1">
        <rect x="70" y="86" width="130" height="13" rx="6"/><rect x="104" y="72" width="78" height="13" rx="6"/>
        <rect x="140" y="120" width="150" height="12" rx="6"/><rect x="180" y="106" width="86" height="12" rx="6"/>
        <rect x="120" y="150" width="100" height="10" rx="5"/>
      </g>
      <path d="M0 332 120 218 220 302 320 198 440 332Z" fill="#12281f"/>
      <path d="M300 332 420 238 520 310 620 228 800 332Z" fill="#0e2119"/>
      <path d="M120 218 220 302 320 198 440 332" fill="none" stroke="#1d3a2a" stroke-width="2" opacity=".7"/>
      <path d="M420 238 520 310 620 228 800 332" fill="none" stroke="#1d3a2a" stroke-width="2" opacity=".6"/>
      <g opacity=".55">
        ${tree(40, 334, .55, true)}${tree(105, 330, .45, true)}${tree(175, 334, .5, true)}
        ${tree(220, 334, .5, true)}${tree(260, 330, .42, true)}${tree(300, 336, .55, true)}
      </g>
      <rect y="332" width="800" height="188" fill="url(#fxGrass)"/>
      <path d="M200 372 Q290 352 390 374 T460 392 L460 470 L200 470Z" fill="url(#fxWater)"/>
      <path d="M240 398 Q310 386 380 400" stroke="#7bd6d6" stroke-width="2" fill="none" opacity=".35"/>
      <path d="M270 424 Q330 414 400 426" stroke="#7bd6d6" stroke-width="1.5" fill="none" opacity=".22"/>
      <g opacity=".9">
        ${tree(92, 340, 1.15, false)}${tree(196, 348, .82, false)}${tree(300, 344, 1.02, false)}${tree(330, 352, .72, false)}
      </g>
      <g transform="translate(280 340)">
        <rect x="-9" y="-32" width="18" height="20" fill="#3f9e44"/>
        <rect x="-9" y="-32" width="18" height="4" fill="#5fd068"/>
        <rect x="-9" y="-12" width="8" height="12" fill="#2a4a6e"/>
        <rect x="1" y="-12" width="8" height="12" fill="#223a56"/>
        <rect x="-11" y="-50" width="22" height="18" fill="#c9a15a"/>
        <rect x="-11" y="-50" width="22" height="6" fill="#4a3524"/>
        <rect x="-13" y="-32" width="4" height="15" fill="#c9a15a"/>
        <rect x="9" y="-32" width="4" height="15" fill="#c9a15a"/>
        <rect x="13" y="-46" width="3" height="26" fill="#8a5a3b" transform="rotate(18 14 -33)"/>
        <rect x="12" y="-50" width="5" height="10" fill="#c9d4d8" transform="rotate(18 14 -45)"/>
      </g>
      <g fill="#d9f7c4">
        <circle class="firefly" cx="150" cy="300" r="2"/>
        <circle class="firefly" cx="200" cy="270" r="1.5"/>
        <circle class="firefly" cx="250" cy="310" r="1.8"/>
        <circle class="firefly" cx="300" cy="290" r="1.4"/>
        <circle class="firefly" cx="350" cy="250" r="1.2"/>
      </g>
      <rect y="332" width="800" height="188" fill="url(#fxGrass)" opacity=".18"/>
    </svg>`;
  }

  function caveScene() {
    return `<svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A dark cave with glowing ores">
      <defs>
        <linearGradient id="fxCave" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050806"/><stop offset=".6" stop-color="#0a1410"/><stop offset="1" stop-color="#0d1a12"/>
        </linearGradient>
        <pattern id="fxStone" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#1a211c"/>
          <rect width="80" height="4" fill="#242e26"/>
          <rect y="40" width="80" height="4" fill="#141a16"/>
          <rect x="40" width="4" height="40" fill="#141a16"/>
          <rect y="40" width="4" height="40" fill="#242e26"/>
          <rect x="10" y="12" width="9" height="6" fill="#2a352c"/>
          <rect x="54" y="22" width="12" height="5" fill="#2a352c"/>
          <rect x="20" y="54" width="7" height="7" fill="#141a16"/>
          <rect x="58" y="58" width="10" height="6" fill="#242e26"/>
        </pattern>
        <radialGradient id="fxTorch"><stop offset="0" stop-color="#f2c66b" stop-opacity=".5"/><stop offset=".45" stop-color="#d9a441" stop-opacity=".16"/><stop offset="1" stop-color="#d9a441" stop-opacity="0"/></radialGradient>
        <radialGradient id="fxVignette"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
        <radialGradient id="fxOreGlow"><stop offset="0" stop-color="#5fd068" stop-opacity=".5"/><stop offset="1" stop-color="#5fd068" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="520" fill="url(#fxCave)"/>
      <rect width="800" height="520" fill="url(#fxStone)" opacity=".82"/>
      <path d="M0 0h800v118q-200 62-400 4T0 142Z" fill="#080d0a"/>
      <path d="M0 520V302q200-42 400 18t400-20v220Z" fill="#0b120e"/>
      <path d="M286 520q18-220 114-300 96 80 114 300Z" fill="#040705"/>
      <path d="M330 520q12-180 70-244 58 64 70 244Z" fill="#08110c"/>
      <path d="M352 520q8-140 48-196 40 56 48 196Z" fill="#0c1a12"/>
      <g opacity=".9">
        <circle cx="400" cy="300" r="120" fill="url(#fxOreGlow)" opacity=".16"/>
        <rect x="118" y="176" width="18" height="18" fill="#2f9e44" transform="rotate(45 127 185)"/>
        <rect x="124" y="182" width="6" height="6" fill="#7bed85" transform="rotate(45 127 185)"/>
        <rect x="196" y="238" width="14" height="14" fill="#2f9e44" transform="rotate(45 203 245)"/>
        <rect x="360" y="180" width="16" height="16" fill="#c9a15a" transform="rotate(45 368 188)"/>
        <rect x="366" y="186" width="5" height="5" fill="#f2d06b" transform="rotate(45 368 188)"/>
        <rect x="420" y="320" width="12" height="12" fill="#b04a4a" transform="rotate(45 426 326)"/>
        <rect x="90" y="330" width="12" height="12" fill="#2f9e44" transform="rotate(45 96 336)"/>
        <rect x="300" y="380" width="14" height="14" fill="#2f9e44" transform="rotate(45 307 387)"/>
        <rect x="250" y="120" width="10" height="10" fill="#c9a15a" transform="rotate(45 255 125)"/>
      </g>
      <g transform="translate(170 280)">
        <circle cx="0" cy="-18" r="54" fill="url(#fxTorch)"/>
        <rect x="-3" y="0" width="6" height="42" fill="#4a3524"/>
        <rect x="-3" y="0" width="2" height="42" fill="#5c4530"/>
        <rect x="-9" y="-10" width="18" height="14" fill="#8a6a2f"/>
        <rect x="-6" y="-20" width="12" height="12" fill="#d9a441"/>
        <rect x="-3" y="-27" width="6" height="10" fill="#f2d06b"/>
        <rect class="flame" x="-2" y="-32" width="4" height="8" fill="#fff3c4"/>
      </g>
      <g fill="#0a0f0c">
        <path d="M0 0h120l-20 90-30 40-40-20L0 160Z"/>
        <path d="M800 0H680l20 90 30 40 40-20 30 50Z"/>
      </g>
      <g fill="#d9f7c4" opacity=".7">
        <circle class="firefly" cx="250" cy="360" r="1.5"/>
        <circle class="firefly" cx="350" cy="330" r="1.2"/>
        <circle class="firefly" cx="430" cy="400" r="1.4"/>
      </g>
      <rect width="800" height="520" fill="url(#fxVignette)"/>
    </svg>`;
  }

  /* ---------- shared data ---------- */
  const DEFAULTS = {
    tab: 'look',
    lift: 0, bri: 100, con: 100, sat: 100, zoom: 25,
    bars: false, dot: false,
    fps: false, ft: false, mem: false, cps: false, keys: false, clock: false,
    leave: false
  };

  const PRESETS = {
    Default:     { lift: 0,  bri: 100, con: 100, sat: 100, bars: false },
    Fullbright:  { lift: 85, bri: 100, con: 100, sat: 105, bars: false },
    Vivid:       { lift: 10, bri: 104, con: 114, sat: 135, bars: false },
    Cinematic:   { lift: 0,  bri: 96,  con: 116, sat: 108, bars: true  },
    'Night shift': { lift: 15, bri: 94, con: 100, sat: 88, bars: false }
  };

  const PRESET_SASS = {
    Default: 'Back to boring. Respect.',
    Fullbright: 'Shadows lifted. Caves have nowhere to hide.',
    Vivid: 'Colours cranked. Subtle is overrated.',
    Cinematic: "Oscar-worthy. Still can't build.",
    'Night shift': 'Easy on the eyes. And your sleep schedule.'
  };

  const SASS = [
    'Zero cheats. Pure skill. Allegedly.',
    'Esc first. Even legends pause.',
    'Your caves called. They want light.',
    'Built different. Mostly blocky.',
    'Skill issue? Not here.',
    'Creepers hate this one trick.'
  ];

  const KEYMAP = {
    KeyW: 'KeyW', KeyA: 'KeyA', KeyS: 'KeyS', KeyD: 'KeyD',
    Space: 'Space',
    ShiftLeft: 'ShiftLeft', ShiftRight: 'ShiftLeft',
    ControlLeft: 'ControlLeft', ControlRight: 'ControlLeft'
  };

  const KEY_LABELS = [
    ['KeyW', 'W'], ['KeyA', 'A'], ['KeyS', 'S'], ['KeyD', 'D'],
    ['Space', 'SPACE'], ['ShiftLeft', 'SNEAK'], ['ControlLeft', 'SPRINT'],
    ['Mouse0', 'LMB'], ['Mouse2', 'RMB']
  ];

  let waypoints = store.get('forestx.demo.waypoints.v1', []);
  if (!Array.isArray(waypoints)) waypoints = [];
  const demos = [];
  let activeDemo = null;

  function saveWaypoints() { store.set('forestx.demo.waypoints.v1', waypoints); }
  function renderAllWaypoints() { demos.forEach(d => d.renderWaypoints()); }

  /* ---------- the demo ---------- */
  class ForestXDemo {
    constructor(frame, options) {
      this.frame = frame;
      this.options = options;
      this.stage = $('[data-stage]', frame);
      this.sceneMount = $('[data-scene]', frame);
      this.hud = $('[data-hud]', frame);
      this.keys = $('[data-keys]', frame);
      this.panel = $('[data-panel]', frame);
      this.panelBody = $('[data-panel-body]', frame);
      this.fab = $('[data-open-panel]', frame);
      this.status = $('[data-demo-status]', frame);
      this.fpsEl = $('[data-fps]', frame);
      this.prefix = options.variant;
      this.state = this.loadState();
      this.active = false;
      this.recording = false;
      this.recorder = null;
      this.stream = null;
      this.chunks = [];
      this.discardRecording = false;
      this.saveTimer = null;
      this.frames = 0;
      this.fps = 60;
      this.frameTime = 16.7;
      this.maxFrameTime = 16.7;
      this.memUsed = 212;
      this.memLimit = 4096;
      this.lastFpsTime = performance.now();
      this.clicks = [];
      this.keysDown = new Set();
      this.onTabChange = null;

      this.buildScene();
      this.renderPanel();
      this.applyState();
      this.bind();
      this.renderKeys();
      this.setLeave(this.state.leave);
      this.fab.hidden = true;
      this.fab.setAttribute('aria-expanded', 'true');
      this.startFps();
      this.updateStatus();
    }

    loadState() {
      const saved = store.get(this.options.storageKey, {});
      const state = { ...DEFAULTS, ...saved };
      if (!['look', 'hud', 'tools'].includes(state.tab)) state.tab = 'look';
      return state;
    }

    saveState() { store.set(this.options.storageKey, this.state); }

    debouncedSave() {
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.saveState(), 250);
    }

    buildScene() {
      this.sceneMount.innerHTML = this.options.variant === 'cave' ? caveScene() : forestScene();
      this.sceneSvg = $('svg', this.sceneMount);
    }

    /* ----- rendering ----- */
    renderPanel() {
      const s = this.state;
      const p = this.prefix;
      $$('[data-tab]', this.panel).forEach(btn => {
        btn.setAttribute('aria-selected', String(btn.dataset.tab === s.tab));
      });

      let html = '';
      if (s.tab === 'look') {
        html = `
          <h3>Presets</h3>
          <div class="chips">${Object.keys(PRESETS).map(name => `<button type="button" class="chip" data-preset="${name}">${name}</button>`).join('')}</div>
          <h3>Light</h3>
          <div class="row"><label for="${p}-lift">Shadow lift</label><span class="val" data-val="lift">${s.lift}%</span></div>
          <input id="${p}-lift" type="range" min="0" max="100" step="1" value="${s.lift}" data-slider="lift">
          <div class="hint">Brightens dark areas on your screen only. It doesn't touch the game's actual lighting.</div>
          <div class="row"><label for="${p}-bri">Brightness</label><span class="val" data-val="bri">${s.bri}%</span></div>
          <input id="${p}-bri" type="range" min="70" max="150" step="1" value="${s.bri}" data-slider="bri">
          <div class="row"><label for="${p}-con">Contrast</label><span class="val" data-val="con">${s.con}%</span></div>
          <input id="${p}-con" type="range" min="80" max="140" step="1" value="${s.con}" data-slider="con">
          <div class="row"><label for="${p}-sat">Saturation</label><span class="val" data-val="sat">${s.sat}%</span></div>
          <input id="${p}-sat" type="range" min="40" max="170" step="1" value="${s.sat}" data-slider="sat">
          <h3>View</h3>
          <div class="row"><label for="${p}-zoom">Zoom power (F9)</label><span class="val" data-val="zoom">${(s.zoom / 25).toFixed(1)}×</span></div>
          <input id="${p}-zoom" type="range" min="12" max="50" step="1" value="${s.zoom}" data-slider="zoom">
          <div class="switch-row"><span>Cinematic bars</span><label class="switch"><input type="checkbox" data-toggle="bars" aria-label="Cinematic bars"><i></i></label></div>
          <div class="switch-row"><span>Centre dot</span><label class="switch"><input type="checkbox" data-toggle="dot" aria-label="Centre dot"><i></i></label></div>
        `;
      } else if (s.tab === 'hud') {
        html = `
          <h3>Performance</h3>
          <div class="switch-row"><span>FPS</span><label class="switch"><input type="checkbox" data-toggle="fps" aria-label="FPS"><i></i></label></div>
          <div class="switch-row"><span>Frame time</span><label class="switch"><input type="checkbox" data-toggle="ft" aria-label="Frame time"><i></i></label></div>
          <div class="switch-row"><span>Memory</span><label class="switch"><input type="checkbox" data-toggle="mem" aria-label="Memory"><i></i></label></div>
          <h3>Input</h3>
          <div class="switch-row"><span>Clicks per second</span><label class="switch"><input type="checkbox" data-toggle="cps" aria-label="Clicks per second"><i></i></label></div>
          <div class="switch-row"><span>Keystrokes</span><label class="switch"><input type="checkbox" data-toggle="keys" aria-label="Keystrokes"><i></i></label></div>
          <h3>Info</h3>
          <div class="switch-row"><span>Clock</span><label class="switch"><input type="checkbox" data-toggle="clock" aria-label="Clock"><i></i></label></div>
          <div class="hint">F7 flips the whole overlay on or off. Anything you leave off costs nothing.</div>
        `;
      } else {
        html = `
          <h3>Capture</h3>
          <div class="chips">
            <button type="button" class="mini-btn" data-action="screenshot">Screenshot</button>
            <button type="button" class="mini-btn" data-action="record">${this.recording ? 'Stop recording' : 'Record'}</button>
            <button type="button" class="mini-btn" data-action="fullscreen">Fullscreen</button>
          </div>
          <h3>Nether converter</h3>
          <div class="nether-row">
            <input type="text" inputmode="numeric" placeholder="X" data-nether="x" aria-label="Overworld X">
            <input type="text" inputmode="numeric" placeholder="Z" data-nether="z" aria-label="Overworld Z">
            <button type="button" class="mini-btn" data-action="convert">Convert</button>
          </div>
          <div class="nether-out" data-nether-out>Overworld → Nether</div>
          <h3>Waypoints</h3>
          <input class="name-input" type="text" placeholder="name" maxlength="24" data-wp-name aria-label="Waypoint name">
          <div class="nether-row">
            <input type="text" inputmode="numeric" placeholder="X" data-wp="x" aria-label="Waypoint X">
            <input type="text" inputmode="numeric" placeholder="Y" data-wp="y" aria-label="Waypoint Y">
            <input type="text" inputmode="numeric" placeholder="Z" data-wp="z" aria-label="Waypoint Z">
          </div>
          <button type="button" class="mini-btn wide" data-action="save-wp">Save waypoint</button>
          <div data-wp-list></div>
          <h3>Settings</h3>
          <div class="switch-row"><span>Ask before closing the tab</span><label class="switch"><input type="checkbox" data-toggle="leave" aria-label="Ask before closing the tab"><i></i></label></div>
          <button type="button" class="mini-btn wide" data-action="reset">Reset ForestX settings</button>
        `;
      }

      this.panelBody.innerHTML = html;
      this.syncPanel();
      this.renderWaypoints();
    }

    syncPanel() {
      const s = this.state;
      $$('[data-slider]', this.panelBody).forEach(input => {
        const key = input.dataset.slider;
        input.value = s[key];
        const val = $(`[data-val="${key}"]`, this.panelBody);
        if (val) val.textContent = key === 'zoom' ? `${(s.zoom / 25).toFixed(1)}×` : `${s[key]}%`;
      });
      $$('[data-toggle]', this.panelBody).forEach(input => {
        input.checked = !!s[input.dataset.toggle];
      });
      const active = this.activePreset();
      $$('[data-preset]', this.panelBody).forEach(btn => {
        btn.classList.toggle('on', btn.dataset.preset === active);
      });
    }

    activePreset() {
      const s = this.state;
      for (const [name, p] of Object.entries(PRESETS)) {
        if (p.lift === s.lift && p.bri === s.bri && p.con === s.con && p.sat === s.sat && p.bars === s.bars) return name;
      }
      return null;
    }

    applyState() {
      const s = this.state;
      const liftFactor = 1 + (s.lift / 100) * 0.9;
      const brightness = (s.bri / 100) * liftFactor;
      this.sceneMount.style.filter = `brightness(${brightness.toFixed(3)}) contrast(${s.con / 100}) saturate(${s.sat / 100})`;
      this.sceneMount.style.transform = `scale(${(s.zoom / 25).toFixed(3)})`;
      this.sceneMount.style.transformOrigin = '50% 50%';

      $$('[data-cinema-top], [data-cinema-bottom]', this.frame).forEach(el => el.classList.toggle('show', s.bars));
      $('[data-dot]', this.frame).classList.toggle('show', s.dot);
      this.keys.classList.toggle('show', s.keys);
      this.renderHud();
      this.syncPanel();
      this.updateStatus();
    }

    renderHud() {
      const s = this.state;
      const lines = [];
      if (s.fps) lines.push(`FPS ${this.fps}`);
      if (s.ft) lines.push(`Frame ${this.frameTime.toFixed(1)} ms (max ${this.maxFrameTime.toFixed(0)})`);
      if (s.mem) lines.push(`MEM ${Math.round(this.memUsed)} / ${Math.round(this.memLimit)} MB`);
      if (s.cps) lines.push(`CPS ${this.currentCps()}`);
      if (s.clock) lines.push(this.clockString());
      this.hud.textContent = lines.join('\n');
      this.hud.classList.toggle('show', lines.length > 0);
    }

    renderKeys() {
      this.keys.innerHTML = KEY_LABELS.map(([code, label]) => `<span class="k" data-key="${code}">${label}</span>`).join('');
      this.keys.classList.toggle('show', this.state.keys);
      this.updateKeys();
    }

    updateKeys() {
      $$('.k', this.keys).forEach(el => el.classList.toggle('on', this.keysDown.has(el.dataset.key)));
    }

    renderWaypoints() {
      const list = $('[data-wp-list]', this.panelBody);
      if (!list) return;
      if (!waypoints.length) {
        list.innerHTML = '<div class="wp-empty">No waypoints yet. Save your first one.</div>';
        return;
      }
      list.innerHTML = waypoints.map((w, i) => `
        <div class="wp">
          <span>${escapeHtml(w.n)} ${w.x} ${w.y} ${w.z} (N ${Math.floor(w.x / 8)} ${Math.floor(w.z / 8)})</span>
          <span><button type="button" data-wp-copy="${i}">Copy</button><button type="button" data-wp-del="${i}">✕</button></span>
        </div>`).join('');
    }

    setSass() {
      const el = $('[data-sass]', this.frame);
      if (el) el.textContent = pick(SASS);
    }

    updateStatus() {
      const s = this.state;
      const anyHud = s.fps || s.ft || s.mem || s.cps || s.keys || s.clock;
      let text = 'overlay ready';
      if (this.recording) text = 'recording';
      else if (!this.panel.classList.contains('closed')) text = 'panel open';
      else if (anyHud) text = 'HUD on';
      else if (s.zoom !== 25) text = `zoom ${(s.zoom / 25).toFixed(1)}×`;
      this.status.textContent = text;
      this.frame.classList.toggle('recording', this.recording);
    }

    /* ----- panel actions ----- */
    openPanel() {
      this.panel.classList.remove('closed');
      this.fab.hidden = true;
      this.fab.setAttribute('aria-expanded', 'true');
      this.setSass();
      this.updateStatus();
    }

    closePanel() {
      this.panel.classList.add('closed');
      this.fab.hidden = false;
      this.fab.setAttribute('aria-expanded', 'false');
      this.updateStatus();
    }

    togglePanel() {
      if (this.panel.classList.contains('closed')) this.openPanel();
      else this.closePanel();
    }

    setTab(tab) {
      if (!['look', 'hud', 'tools'].includes(tab)) return;
      this.state.tab = tab;
      this.saveState();
      this.renderPanel();
      this.openPanel();
      if (this.onTabChange) this.onTabChange(tab);
      this.updateStatus();
    }

    applyPreset(name) {
      const preset = PRESETS[name];
      if (!preset) return;
      Object.assign(this.state, preset);
      this.saveState();
      this.applyState();
      toast(PRESET_SASS[name] || `${name} applied.`);
    }

    toggleZoom() {
      this.state.zoom = this.state.zoom > 25 ? 25 : 50;
      this.saveState();
      this.applyState();
      toast(this.state.zoom > 25 ? 'Zoom on. Nosy.' : 'Zoom off. Back to reality.');
    }

    toggleHud() {
      const on = !(this.state.fps || this.state.cps || this.state.clock);
      this.state.fps = on;
      this.state.cps = on;
      this.state.clock = on;
      this.saveState();
      this.applyState();
      toast(on ? 'HUD on. Look at those frames.' : 'HUD off. Back to the game.');
    }

    reset() {
      this.stopRecording(true);
      this.setLeave(false);
      this.state = { ...DEFAULTS, tab: this.state.tab };
      store.remove(this.options.storageKey);
      this.saveState();
      this.renderPanel();
      this.applyState();
      this.updateStatus();
      toast('Demo reset. Back to boring. Respect.');
    }

    setLeave(enabled) {
      if (enabled) {
        if (!this.onBeforeUnload) {
          this.onBeforeUnload = e => { e.preventDefault(); e.returnValue = ''; };
          window.addEventListener('beforeunload', this.onBeforeUnload);
        }
      } else if (this.onBeforeUnload) {
        window.removeEventListener('beforeunload', this.onBeforeUnload);
        this.onBeforeUnload = null;
      }
    }

    /* ----- tools ----- */
    doAction(action) {
      switch (action) {
        case 'screenshot': this.screenshot(); break;
        case 'record': this.toggleRecording(); break;
        case 'fullscreen': this.fullscreen(); break;
        case 'convert': this.convertNether(); break;
        case 'save-wp': this.saveWaypoint(); break;
        case 'reset': this.reset(); break;
      }
    }

    screenshot() {
      if (!this.sceneSvg) return;
      try {
        const clone = this.sceneSvg.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', '1600');
        clone.setAttribute('height', '1040');
        const data = new XMLSerializer().serializeToString(clone);
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 1600;
            canvas.height = 1040;
            const ctx = canvas.getContext('2d');
            ctx.filter = this.sceneMount.style.filter || 'none';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
              URL.revokeObjectURL(url);
              if (!blob) { toast('Screenshot failed.'); return; }
              download(blob, `forestx-${stamp()}.png`);
              toast('Screenshot saved. Frame it.');
            }, 'image/png');
          } catch {
            URL.revokeObjectURL(url);
            toast('Screenshot failed.');
          }
        };
        img.onerror = () => { URL.revokeObjectURL(url); toast('Screenshot failed.'); };
        img.src = url;
      } catch {
        toast('Screenshot blocked.');
      }
    }

    toggleRecording() {
      if (this.recording) { this.stopRecording(false); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia || !window.MediaRecorder) {
        toast('Recording is not available in this browser.');
        return;
      }
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).then(stream => {
        try {
          const recorder = new MediaRecorder(stream);
          this.stream = stream;
          this.recorder = recorder;
          this.chunks = [];
          this.discardRecording = false;
          recorder.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
          recorder.onstop = () => {
            const chunks = this.chunks;
            const discard = this.discardRecording;
            stream.getTracks().forEach(track => track.stop());
            if (!discard && chunks.length) {
              download(new Blob(chunks, { type: 'video/webm' }), `forestx-${stamp()}.webm`);
              toast('Recording saved. Evidence secured.');
            }
            this.chunks = [];
            this.discardRecording = false;
          };
          recorder.onerror = () => { toast('Recording failed.'); this.stopRecording(true); };
          const track = stream.getVideoTracks()[0];
          if (track) track.addEventListener('ended', () => this.stopRecording(false));
          recorder.start();
          this.recording = true;
          this.frame.classList.add('recording');
          this.updateStatus();
          const btn = $('[data-action="record"]', this.panelBody);
          if (btn) btn.textContent = 'Stop recording';
          toast("Recording. Don't embarrass yourself.");
        } catch {
          stream.getTracks().forEach(track => track.stop());
          toast('Recording failed.');
        }
      }).catch(() => toast('Recording cancelled.'));
    }

    stopRecording(discard) {
      if (!this.recorder) return;
      this.discardRecording = !!discard;
      try { this.recorder.stop(); } catch { /* already stopped */ }
      this.recorder = null;
      this.stream = null;
      this.recording = false;
      this.frame.classList.remove('recording');
      const btn = $('[data-action="record"]', this.panelBody);
      if (btn) btn.textContent = 'Record';
      this.updateStatus();
    }

    fullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => toast('Could not exit fullscreen.'));
      } else if (this.frame.requestFullscreen) {
        this.frame.requestFullscreen().then(() => toast('Fullscreen. Press Esc to exit.')).catch(() => toast('Fullscreen blocked by your browser. Rude.'));
      } else {
        toast('Fullscreen is not available here.');
      }
    }

    convertNether() {
      const xi = $('[data-nether="x"]', this.panelBody);
      const zi = $('[data-nether="z"]', this.panelBody);
      const out = $('[data-nether-out]', this.panelBody);
      if (!xi || !zi || !out) return;
      const xRaw = xi.value.trim();
      const zRaw = zi.value.trim();
      if (xRaw === '' || zRaw === '') {
        out.textContent = 'Enter X and Z coordinates.';
        out.style.color = 'var(--danger)';
        return;
      }
      const x = Number(xRaw);
      const z = Number(zRaw);
      if (!Number.isFinite(x) || !Number.isFinite(z)) {
        out.textContent = 'Enter valid numbers.';
        out.style.color = 'var(--danger)';
        return;
      }
      out.style.color = '';
      out.textContent = `Nether  X ${Math.floor(x / 8)}  Z ${Math.floor(z / 8)}`;
    }

    saveWaypoint() {
      const nameInput = $('[data-wp-name]', this.panelBody);
      const xi = $('[data-wp="x"]', this.panelBody);
      const yi = $('[data-wp="y"]', this.panelBody);
      const zi = $('[data-wp="z"]', this.panelBody);
      if (!xi || !yi || !zi) return;
      const xRaw = xi.value.trim();
      const yRaw = yi.value.trim();
      const zRaw = zi.value.trim();
      if (xRaw === '' || yRaw === '' || zRaw === '') { toast('Enter X, Y, and Z.'); return; }
      const x = Number(xRaw);
      const y = Number(yRaw);
      const z = Number(zRaw);
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) { toast('Enter valid numbers.'); return; }
      const name = ((nameInput && nameInput.value.trim()) || `Point ${waypoints.length + 1}`).slice(0, 24);
      waypoints.push({ n: name, x, y, z });
      saveWaypoints();
      renderAllWaypoints();
      if (nameInput) nameInput.value = '';
      xi.value = ''; yi.value = ''; zi.value = '';
      toast('Waypoint saved. Try not to get lost anyway.');
    }

    async copyWaypoint(index) {
      const w = waypoints[index];
      if (!w) return;
      try {
        await navigator.clipboard.writeText(`${w.x} ${w.y} ${w.z}`);
        toast('Copied. Go brag.');
      } catch {
        toast('Copy failed. Your browser said no.');
      }
    }

    deleteWaypoint(index) {
      if (!waypoints[index]) return;
      waypoints.splice(index, 1);
      saveWaypoints();
      renderAllWaypoints();
      toast('Waypoint deleted.');
    }

    /* ----- live counters ----- */
    startFps() {
      let last = performance.now();
      let frames = 0;
      let sum = 0;
      let max = 0;
      const loop = now => {
        const dt = now - last;
        last = now;
        frames++;
        sum += dt;
        if (dt > max) max = dt;
        if (now - this.lastFpsTime >= 500) {
          this.fps = Math.max(1, Math.round(frames * 1000 / (now - this.lastFpsTime)));
          this.frameTime = sum / frames;
          this.maxFrameTime = max;
          if (performance.memory) {
            this.memUsed = performance.memory.usedJSHeapSize / 1048576;
            this.memLimit = performance.memory.jsHeapSizeLimit / 1048576;
          }
          frames = 0; sum = 0; max = 0;
          this.lastFpsTime = now;
          if (this.fpsEl) this.fpsEl.textContent = this.fps;
          this.renderHud();
        }
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    currentCps() {
      const now = performance.now();
      this.clicks = this.clicks.filter(t => now - t < 1000);
      return this.clicks.length;
    }

    clockString() {
      const d = new Date();
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    /* ----- events ----- */
    bind() {
      this.frame.addEventListener('pointerenter', () => { this.active = true; activeDemo = this; });
      this.frame.addEventListener('pointerleave', () => { this.active = false; if (activeDemo === this) activeDemo = null; });
      this.frame.addEventListener('focusin', () => { this.active = true; activeDemo = this; });
      this.frame.addEventListener('focusout', e => {
        if (!this.frame.contains(e.relatedTarget)) {
          this.active = false;
          if (activeDemo === this) activeDemo = null;
        }
      });

      this.fab.addEventListener('click', () => this.openPanel());
      $('[data-close-panel]', this.frame).addEventListener('click', () => this.closePanel());
      $('[data-reset]', this.frame).addEventListener('click', () => this.reset());
      $$('[data-tab]', this.panel).forEach(btn => btn.addEventListener('click', () => this.setTab(btn.dataset.tab)));

      this.panelBody.addEventListener('input', e => {
        const slider = e.target.closest('[data-slider]');
        if (!slider) return;
        const key = slider.dataset.slider;
        this.state[key] = Number(slider.value);
        const val = $(`[data-val="${key}"]`, this.panelBody);
        if (val) val.textContent = key === 'zoom' ? `${(this.state.zoom / 25).toFixed(1)}×` : `${this.state[key]}%`;
        this.applyState();
        this.debouncedSave();
      });

      this.panelBody.addEventListener('change', e => {
        const toggle = e.target.closest('[data-toggle]');
        if (!toggle) return;
        const key = toggle.dataset.toggle;
        this.state[key] = toggle.checked;
        if (key === 'leave') this.setLeave(toggle.checked);
        this.saveState();
        this.applyState();
        this.updateStatus();
        if (key === 'keys') this.renderKeys();
      });

      this.panelBody.addEventListener('click', e => {
        const preset = e.target.closest('[data-preset]');
        if (preset) { this.applyPreset(preset.dataset.preset); return; }
        const action = e.target.closest('[data-action]');
        if (action) { this.doAction(action.dataset.action); return; }
        const copy = e.target.closest('[data-wp-copy]');
        if (copy) { this.copyWaypoint(Number(copy.dataset.wpCopy)); return; }
        const del = e.target.closest('[data-wp-del]');
        if (del) { this.deleteWaypoint(Number(del.dataset.wpDel)); }
      });

      this.panelBody.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        if (e.target.closest('[data-nether]')) { e.preventDefault(); this.convertNether(); }
        else if (e.target.closest('[data-wp], [data-wp-name]')) { e.preventDefault(); this.saveWaypoint(); }
      });

      this.stage.addEventListener('mousedown', e => {
        if (e.target.closest('.panel, .panel-fab')) return;
        const now = performance.now();
        this.clicks.push(now);
        this.clicks = this.clicks.filter(t => now - t < 1000);
        if (!this.state.keys) return;
        const code = e.button === 0 ? 'Mouse0' : e.button === 2 ? 'Mouse2' : null;
        if (code) { this.keysDown.add(code); this.updateKeys(); }
      });
      this.stage.addEventListener('contextmenu', e => e.preventDefault());
      window.addEventListener('mouseup', () => {
        if (!this.keysDown.has('Mouse0') && !this.keysDown.has('Mouse2')) return;
        this.keysDown.delete('Mouse0');
        this.keysDown.delete('Mouse2');
        this.updateKeys();
      });

      window.addEventListener('keydown', e => {
        if (!this.active || !this.state.keys) return;
        const tag = e.target.tagName;
        const type = e.target.type;
        if (tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable || (tag === 'INPUT' && ['text', 'number', 'search', 'email', 'url', 'password'].includes(type))) return;
        const code = KEYMAP[e.code];
        if (!code) return;
        if (e.code === 'Space') e.preventDefault();
        this.keysDown.add(code);
        this.updateKeys();
      });
      window.addEventListener('keyup', e => {
        const code = KEYMAP[e.code];
        if (!code) return;
        this.keysDown.delete(code);
        this.updateKeys();
      });
    }
  }

  /* ---------- boot the demos ---------- */
  const heroFrame = $('[data-demo="hero"]');
  const caveFrame = $('[data-demo="cave"]');
  if (heroFrame) {
    const hero = new ForestXDemo(heroFrame, { variant: 'forest', storageKey: 'forestx.demo.hero.v1' });
    demos.push(hero);
  }
  if (caveFrame) {
    const cave = new ForestXDemo(caveFrame, { variant: 'cave', storageKey: 'forestx.demo.cave.v1' });
    demos.push(cave);
    cave.onTabChange = tab => {
      $$('[data-tab-card]').forEach(card => card.classList.toggle('active', card.dataset.tabCard === tab));
    };
    cave.onTabChange(cave.state.tab);
  }

  /* tab cards in the copy column drive the cave demo */
  $$('[data-tab-card]').forEach(card => {
    card.addEventListener('click', () => {
      if (!caveFrame) return;
      const cave = demos.find(d => d.frame === caveFrame);
      if (!cave) return;
      cave.setTab(card.dataset.tabCard);
      if (window.innerWidth <= 1080) caveFrame.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    });
  });

  /* reset button in the copy column */
  $$('[data-reset-demo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = demos.find(d => d.frame === $(`[data-demo="${btn.dataset.resetDemo}"]`));
      if (target) {
        target.reset();
        if (window.innerWidth <= 1080) target.frame.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  /* global F7 / F8 / F9 shortcuts for whichever demo is hovered or focused */
  window.addEventListener('keydown', e => {
    if (!activeDemo) return;
    const tag = e.target.tagName;
    const type = e.target.type;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable || (tag === 'INPUT' && ['text', 'number', 'search', 'email', 'url', 'password'].includes(type))) return;
    if (e.key === 'F8') { e.preventDefault(); activeDemo.togglePanel(); }
    else if (e.key === 'F9') { e.preventDefault(); activeDemo.toggleZoom(); }
    else if (e.key === 'F7') { e.preventDefault(); activeDemo.toggleHud(); }
  });

  /* ---------- performance chart ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function perfData(mode) {
    const rand = mulberry32(mode === 'off' ? 1337 : 4242);
    return Array.from({ length: 44 }, () => {
      let v = 16.7 + (rand() - 0.5) * (mode === 'off' ? 0.5 : 0.9);
      if (mode === 'on' && rand() < 0.12) v += 1.2 + rand() * 1.6;
      return v;
    });
  }

  const perfChart = $('[data-perf-chart]');
  if (perfChart) {
    const perfButtons = $$('[data-perf]');
    const perfSets = { off: perfData('off'), on: perfData('on') };
    let perfMode = 'off';

    const renderPerf = mode => {
      perfMode = mode;
      const values = perfSets[mode];
      perfChart.dataset.mode = mode;
      const bars = values.map(v => {
        const h = clamp((v - 12) / 12 * 100, 2, 100);
                const spike = v > 17.6;
        return `<div class="perf-bar${spike ? ' spike' : ''}" style="height:${h.toFixed(2)}%"></div>`;
      }).join('');
      perfChart.innerHTML = `<div class="perf-plot"><div class="perf-line" style="bottom:39.2%"><span>16.7 ms · 60 fps</span></div><div class="perf-bars">${bars}</div></div>`;

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const p99 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))];
      const fps = 1000 / avg;
      const low = 1000 / p99;
      const cost = Math.max(0, avg - 16.7);
      const avgEl = $('[data-perf-avg]');
      const fpsEl = $('[data-perf-fps]');
      const lowEl = $('[data-perf-low]');
      const costEl = $('[data-perf-cost]');
      if (avgEl) avgEl.textContent = avg.toFixed(1);
      if (fpsEl) fpsEl.textContent = Math.round(fps);
      if (lowEl) lowEl.textContent = Math.round(low);
      if (costEl) costEl.textContent = cost.toFixed(1);
      perfChart.setAttribute('aria-label', `Frame time chart, HUD ${mode}. Average ${avg.toFixed(1)} milliseconds, ${Math.round(fps)} FPS.`);
    };

    perfButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        perfButtons.forEach(b => b.classList.toggle('is-active', b === btn));
        renderPerf(btn.dataset.perf);
      });
    });
    renderPerf('off');
  }

  /* ---------- mobile menu ---------- */
  const menuBtn = $('.menu-btn');
  const mobileMenu = $('#mobile-menu');
  if (menuBtn && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', () => {
      const willOpen = mobileMenu.hidden;
      mobileMenu.hidden = !willOpen;
      menuBtn.setAttribute('aria-expanded', String(willOpen));
    });
    $$('#mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 1080) closeMenu(); });
  }

  /* ---------- reveal on scroll ---------- */
  const revealTargets = $$('.section-head, .feature-card, .ethos-banner, .perf-card, .perf-notes > div, .controls-copy, .keyboard-card, .faq-copy, .faq-item, .cta-card, .stats');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealTargets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 60}ms`;
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
      io.observe(el);
    });
  }
})();
