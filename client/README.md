# ForestX client parts

The client is a single HTML file split into 4 parts for upload. The launcher
(`/client.html`) fetches the parts in order, concatenates them in the browser,
and opens the result. Nothing is uploaded; the assembly happens locally.

## Assembly order

```
forestx3.html → forestx4.html → forestx2.html → forestx1.html
```

Why this order:

- `forestx2.html` ends inside the `eag-inline-sounds` base64 payload.
- `forestx1.html` begins with the rest of that payload and then the client
  shell, overlay, and body.
- `forestx3.html` and `forestx4.html` contain the document head and the
  earlier inline payloads (assets, wasm).

The `PARTS` array in `assets/launcher.js` must match this order.

## Build a single file (optional)

```bash
node scripts/build-client.mjs
```

This writes `client/forestx.html` (gitignored). The launcher does the same
thing in the browser, so the build script is only for local testing.

## Notes

- The parts are large; the launcher shows per-part progress.
- If a part is missing, the launcher shows which one and a Retry button.
- The client expects all four parts. The launcher will not open a partial
  build.
