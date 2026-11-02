/* ===== ForestX landing — interactions ===== */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("#year").textContent = new Date().getFullYear();

  /* ---- Toast ---- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ---- Theme (day / night) ---- */
  const rootEl = document.documentElement;
  const themeToggle = $("#themeToggle");
  function setTheme(t) {
    rootEl.dataset.theme = t;
    $("#themeIcon").textContent = t === "night" ? "☀️" : "🌙";
    $("#themeLabel").textContent = t === "night" ? "Day" : "Night";
    try { localStorage.setItem("forestx-theme", t); } catch {}
  }
  try {
    const saved = localStorage.getItem("forestx-theme");
    if (saved) setTheme(saved);
  } catch {}
  themeToggle.addEventListener("click", () => {
    const next = rootEl.dataset.theme === "night" ? "day" : "night";
    setTheme(next);
    showToast(next === "day" ? "☀️ Day mode — creepers hate this." : "🌙 Night mode — watch for zombies.");
  });

  /* ---- Nav ---- */
  const nav = $("#topNav"), burger = $("#navBurger"), navLinks = $("#navLinks");
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("a", navLinks).forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

  const progress = $("#scrollProgress"), backTop = $("#backTop");
  addEventListener("scroll", () => {
    const y = scrollY, max = document.body.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    nav.classList.toggle("scrolled", y > 10);
    backTop.classList.toggle("show", y > 700);
  }, { passive: true });
  backTop.addEventListener("click", () => scrollTo({ top: 0, behavior: Reduced ? "auto" : "smooth" }));

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---- Animated counters ---- */
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
      counterIO.unobserve(el);
      if (reduced || target === 0) { el.textContent = target + suffix; return; }
      const t0 = performance.now(), dur = 1300;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$(".stat-num").forEach(el => counterIO.observe(el));

  /* ---- Pixel terrain strips ---- */
  $$(".terrain-strip").forEach(strip => {
    let h = 30;
    for (let i = 0; i < 48; i++) {
      h = Math.max(20, Math.min(52, h + (Math.random() * 16 - 8)));
      const b = document.createElement("i");
      b.style.height = h + "px";
      strip.appendChild(b);
    }
  });

  /* ---- Marquee duplication (seamless loop) ---- */
  const track = $("#marqueeTrack");
  track.innerHTML += track.innerHTML;

  /* ---- Hero: leaf/firefly particles ---- */
  const canvas = $("#particleCanvas"), ctx = canvas.getContext("2d");
  let W, H, particles = [];
  function sizeCanvas() {
    const r = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = r.width; H = canvas.height = r.height;
  }
  function makeParticles() {
    particles = Array.from({ length: reduced ? 0 : 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: 2 + Math.random() * 4, vy: .25 + Math.random() * .7,
      vx: -.3 + Math.random() * .6, rot: Math.random() * Math.PI, vr: -.02 + Math.random() * .04,
      hue: 85 + Math.random() * 45, a: .35 + Math.random() * .5,
    }));
  }
  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    const night = rootEl.dataset.theme === "night";
    for (const p of particles) {
      p.y += p.vy; p.x += p.vx + Math.sin(p.y * .012) * .4; p.rot += p.vr;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (night) { // fireflies: soft glowing dots
        ctx.globalAlpha = p.a * (0.6 + 0.4 * Math.sin(p.y * .05));
        ctx.fillStyle = "#c8ff8a"; ctx.shadowColor = "#a4ff4d"; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, 0, p.s * .45, 0, 7); ctx.fill();
      } else { // leaves: tumbling squares
        ctx.globalAlpha = p.a; ctx.fillStyle = `hsl(${p.hue} 55% 38%)`;
        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
      }
      ctx.restore();
    }
    if (!reduced) requestAnimationFrame(drawParticles);
  }
  sizeCanvas(); makeParticles(); drawParticles();
  addEventListener("resize", () => { sizeCanvas(); }, { passive: true });

  /* ---- Hero screenshot: tilt + hotbar ---- */
  const shot = $("#heroShot"), frame = $(".shot-frame", shot);
  if (!reduced && matchMedia("(pointer:fine)").matches) {
    shot.addEventListener("mousemove", e => {
      const r = shot.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      frame.style.transform = `rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });
    shot.addEventListener("mouseleave", () => frame.style.transform = "");
  }
  const slots = $$("#hotbar .slot");
  let activeSlot = 0;
  function selectSlot(i) {
    slots[activeSlot].classList.remove("is-active");
    activeSlot = ((i % slots.length) + slots.length) % slots.length;
    slots[activeSlot].classList.add("is-active");
  }
  slots.forEach((s, i) => s.addEventListener("click", () => selectSlot(i)));
  if (!reduced) setInterval(() => selectSlot(activeSlot + 1), 2600);

  /* ---- Mining playground ---- */
  const grid = $("#mineGrid");
  const HITS = { leaves: 1, dirt: 1, grass: 2, sand: 1, log: 2, stone: 3, gold: 3, diamond: 3, bedrock: Infinity };
  const NAMES = { leaves: "Leaves", dirt: "Dirt", grass: "Grass block", sand: "Sand", log: "Oak log", stone: "Stone", gold: "Gold ore", diamond: "Diamond ore!", bedrock: "Bedrock" };
  const Colors = { grass: "#6abe30", dirt: "#8a5a2b", log: "#855a25", leaves: "#4c9440", stone: "#7d7d7d", gold: "#f5c542", diamond: "#54e0d2", sand: "#e8d284", bedrock: "#2e2e2e" };
  const inventory = { grass: 0, dirt: 0, log: 0, leaves: 0, stone: 0, gold: 0, diamond: 0 };
  let mined = 0, xp = 0, audioCtx = null;

  function pop(freq = 220) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(.06, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + .09);
      o.connect(g).connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + .1);
    } catch {}
  }

  function buildTerrain() {
    grid.innerHTML = "";
    const cols = innerWidth <= 640 ? 8 : 16, rows = 7;
    // heightmap
    const heights = [];
    let h = 3 + Math.floor(Math.random() * 2);
    for (let c = 0; c < cols; c++) {
      h = Math.max(2, Math.min(4, h + Math.floor(Math.random() * 3) - 1));
      heights.push(h);
    }
    const treeCols = new Set();
    for (let c = 1; c < cols - 1; c++) if (Math.random() < .14) { treeCols.add(c); c += 2; }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ground = rows - heights[c]; // first solid row
        let type = "empty";
        if (r === rows - 1) type = "bedrock";
        else if (r === ground) type = Math.random() < .08 ? "sand" : "grass";
        else if (r > ground && r <= ground + 1) type = "dirt";
        else if (r > ground + 1) {
          const roll = Math.random();
          type = roll < .045 ? "diamond" : roll < .11 ? "gold" : "stone";
        }
        // trees above ground
        if (treeCols.has(c)) {
          if (r === ground - 1 || r === ground - 2) type = "log";
          if (r === ground - 3) type = "leaves";
        }
        if (r === ground - 3 && (treeCols.has(c - 1) || treeCols.has(c + 1))) type = "leaves";

        const b = document.createElement("button");
        b.type = "button";
        b.className = "block " + type;
        b.dataset.type = type;
        b.dataset.hits = 0;
        b.setAttribute("role", "gridcell");
        b.setAttribute("aria-label", type === "empty" ? "Sky" : NAMES[type] + " — click to mine");
        b.innerHTML = '<span class="crack"></span>';
        grid.appendChild(b);
      }
    }
  }

  function burst(block, type) {
    const rect = block.getBoundingClientRect(), hostRect = grid.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("span");
      p.className = "mine-particle";
      p.style.background = Colors[type] || "#999";
      p.style.left = rect.left - hostRect.left + rect.width / 2 + "px";
      p.style.top = rect.top - hostRect.top + rect.height / 2 + "px";
      grid.appendChild(p);
      const dx = (Math.random() - .5) * 90, dy = (Math.random() - .7) * 90;
      p.animate([
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}px,${dy + 40}px) rotate(${Math.random() * 260}deg)`, opacity: 0 },
      ], { duration: 550 + Math.random() * 250, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => p.remove();
    }
  }

  function updateInventory(type) {
    if (!(type in inventory)) return;
    inventory[type]++;
    const el = $(`[data-inv="${type}"] b`);
    el.textContent = inventory[type];
    const item = el.closest(".inv-item");
    item.classList.remove("bump"); void item.offsetWidth; item.classList.add("bump");
  }

  function gainXp(amount) {
    xp += amount;
    const level = Math.floor(xp / 10) + 1;
    $("#mineLevel").textContent = level;
    $("#mineXpFill").style.width = ((xp % 10) / 10 * 100) + "%";
    $("#xpLevel").textContent = 26 + level;
    if (xp % 10 === 0 && xp > 0) { pop(880); showToast(`⭐ Level up! You reached level ${level}. The real game has enchantments, just saying.`); }
  }

  grid.addEventListener("click", e => {
    const block = e.target.closest(".block");
    if (!block || block.dataset.type === "empty") return;
    const type = block.dataset.type;

    if (type === "bedrock") {
      block.classList.remove("hit"); void block.offsetWidth; block.classList.add("hit");
      pop(90); showToast("⬛ Bedrock: unbreakable. Nice try though.");
      return;
    }
    const hits = ++block.dataset.hits;
    block.classList.remove("hit"); void block.offsetWidth; block.classList.add("hit");
    pop(160 + hits * 60);

    if (hits < HITS[type]) {
      $(".crack", block).style.opacity = hits / HITS[type];
      return;
    }
    // mined!
    pop(type === "diamond" ? 1040 : 520);
    burst(block, type);
    block.classList.add("break");
    setTimeout(() => {
      block.className = "block empty"; block.dataset.type = "empty"; block.dataset.hits = 0;
      block.innerHTML = '<span class="crack"></span>';
      block.setAttribute("aria-label", "Sky");
    }, 200);
    mined++;
    $("#minedCount").textContent = mined;
    updateInventory(type === "grass" ? "grass" : type);
    gainXp(type === "diamond" ? 5 : type === "gold" ? 3 : 1);
    if (type === "diamond") showToast("💎 DIAMONDS! Imagine this feeling at 60fps in the full client.");
    else if (mined === 25) showToast("⛏️ 25 blocks mined on a landing page. Imagine the actual game → Play Online");
  });

  $("#regenBtn").addEventListener("click", () => { buildTerrain(); showToast("🗺️ New terrain generated. Fresh diamonds somewhere down there…"); });
  let resizeTimer, lastCols = innerWidth <= 640 ? 8 : 16;
  addEventListener("resize", () => {
    const cols = innerWidth <= 640 ? 8 : 16;
    if (cols === lastCols) return; // ignore mobile URL-bar resizes mid-game
    lastCols = cols;
    clearTimeout(resizeTimer); resizeTimer = setTimeout(buildTerrain, 400);
  }, { passive: true });
  buildTerrain();

  /* ---- Download card ---- */
  $("#downloadBtn").addEventListener("click", () => {
    $("#fileBarFill").style.width = "100%";
    $("#fileBarLabel").textContent = "Downloading forestx.html (~86 MB)… save it anywhere, double-click, play. 📦";
    showToast("📦 Download started — one file, that's the whole game.");
  });
  $("#copyLinkBtn").addEventListener("click", async () => {
    const url = "https://v0-forestx.vercel.app/forestx.html";
    try { await navigator.clipboard.writeText(url); showToast("🔗 Download link copied. Go share it with a friend."); }
    catch { showToast("🔗 Link: " + url); }
  });

  /* ---- Interactive keyboard ---- */
  const kbStatus = $("#kbStatus");
  const keyLabel = { Space: "SPACE — Jump!", F8: "F8 — ForestX menu (in-game)", Escape: "ESC — Release mouse", ShiftLeft: "SHIFT — Sneak", ShiftRight: "SHIFT — Sneak", ControlLeft: "CTRL — Sprint", ControlRight: "CTRL — Sprint", KeyW: "W — Forward", KeyA: "A — Strafe left", KeyS: "S — Backward", KeyD: "D — Strafe right" };
  function setKey(code, on) {
    $$(`[data-key="${code}"]`).forEach(k => k.classList.toggle("active", on));
    if (code === "ShiftRight") $$('[data-key="ShiftLeft"]').forEach(k => k.classList.toggle("active", on));
    if (code === "ControlRight") $$('[data-key="ControlLeft"]').forEach(k => k.classList.toggle("active", on));
  }
  let controlsVisible = false;
  new IntersectionObserver(es => es.forEach(e => controlsVisible = e.isIntersecting), { threshold: .2 }).observe($("#controls"));
  addEventListener("keydown", e => {
    setKey(e.code, true);
    if (keyLabel[e.code]) kbStatus.textContent = "Last key: " + keyLabel[e.code];
    if (e.code === "Space" && controlsVisible && !/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) e.preventDefault();
  });
  addEventListener("keyup", e => setKey(e.code, false));

  /* ---- Fake server pings ---- */
  function refreshPings() {
    $$("[data-ping]").forEach(ping => {
      const bars = 3 + Math.floor(Math.random() * 3);
      $$("i", ping).forEach((bar, i) => bar.classList.toggle("on", i < bars));
    });
    $$("[data-players]").forEach(el => {
      const [cur, max] = el.textContent.split("/").map(Number);
      const next = Math.max(1, Math.min(max, cur + Math.floor(Math.random() * 7) - 3));
      el.textContent = `${next}/${max}`;
    });
  }
  refreshPings();
  if (!reduced) setInterval(refreshPings, 3400);

  /* ---- FAQ accordion ---- */
  $$(".faq").forEach(faq => {
    const btn = $(".faq-q", faq), body = $(".faq-a", faq);
    btn.addEventListener("click", () => {
      const open = faq.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0px";
    });
  });
})();
