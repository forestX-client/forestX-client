/* ============================================================
   ForestX Client — browser-side assembly
   The client HTML is split across 4 parts. We fetch them in
   order, concatenate the Blobs, and open the result. Nothing
   is uploaded; the assembly happens locally.
   ============================================================ */
(() => {
  'use strict';

  // Assembly order: the first two parts complete the sounds payload,
  // then the client shell and body. Update this when new parts land.
  const PARTS = ['forestx3.html', 'forestx4.html', 'forestx2.html', 'forestx1.html'];
  const BASE = 'client/parts/';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const statusEl = $('#launcher-status');
  const titleEl = $('#launcher-title');
  const bar = $('[data-launcher-bar]');
  const barWrap = $('[data-launcher-bar-wrap]');
  const meta = $('[data-launcher-meta]');
  const size = $('[data-launcher-size]');
  const retry = $('[data-retry]');
  const launch = $('[data-launch]');
  const partList = $('[data-part-list]');

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function setProgress(completed, totalBytes) {
    const pct = Math.round((completed / PARTS.length) * 100);
    if (bar) bar.style.width = `${pct}%`;
    if (barWrap) barWrap.setAttribute('aria-valuenow', String(pct));
    if (meta) meta.textContent = `${completed} / ${PARTS.length} parts`;
    if (size) size.textContent = formatBytes(totalBytes);
  }

  function setPart(file, state, text) {
    if (!partList) return;
    const li = partList.querySelector(`[data-part="${file}"]`);
    if (!li) return;
    li.dataset.state = state;
    const status = li.querySelector('.part-status');
    if (status) status.textContent = text;
  }

  async function fetchPart(file, onProgress) {
    const res = await fetch(BASE + file, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`missing ${file}`);
    if (!res.body) return res.blob();
    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        onProgress(received);
      }
    }
    return new Blob(chunks, { type: 'text/html' });
  }

  async function load() {
    if (retry) retry.hidden = true;
    if (launch) launch.hidden = true;
    setStatus('Checking for client parts…');
    setProgress(0, 0);
    PARTS.forEach(file => setPart(file, 'waiting', 'waiting'));

    const blobs = [];
    let totalBytes = 0;
    let completed = 0;
    let missing = 0;

    for (const file of PARTS) {
      setPart(file, 'loading', '0 B');
      setStatus(`Loading ${file}…`);
      try {
        const blob = await fetchPart(file, received => {
          setPart(file, 'loading', formatBytes(received));
        });
        blobs.push(blob);
        totalBytes += blob.size;
        completed++;
        setPart(file, 'ready', formatBytes(blob.size));
        setProgress(completed, totalBytes);
      } catch {
        missing++;
        setPart(file, 'missing', 'missing');
      }
    }

    if (missing === 0 && blobs.length === PARTS.length) {
      setStatus('All parts ready. Launching ForestX…');
      setProgress(PARTS.length, totalBytes);
      if (titleEl) titleEl.textContent = 'Launching ForestX…';
      document.title = 'Launching ForestX…';
      const blob = new Blob(blobs, { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      if (launch) {
        launch.href = url;
        launch.hidden = false;
      }
      // Give the progress screen a beat, then hand off to the client.
      setTimeout(() => {
        try { window.location.replace(url); }
        catch { if (launch) launch.click(); }
      }, 700);
    } else {
      setStatus(`The client build isn't complete yet. ${completed} of ${PARTS.length} parts ready.`);
      if (titleEl) titleEl.textContent = 'Client parts still needed.';
      if (retry) retry.hidden = false;
    }
  }

  if (retry) retry.addEventListener('click', load);
  load();
})();
