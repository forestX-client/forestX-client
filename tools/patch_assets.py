#!/usr/bin/env python3
"""Edit the game's OWN title-screen assets inside forestx.html.

The client embeds `assets.epk` as a base64 octet-stream <script>
(id=eag-inline-assets; the shell's decodePayload only base64-decodes it).
This tool:
  1. decodes that payload,
  2. parses the classic Eaglercraft EPK format (EAGPKG$$, ver2.0,
     gzip stream of HEAD/FILE entries with CRC32 — byte layout per
     lax1dude's EPKDecompilerSP/EPKCompiler),
  3. renames the real title-screen buttons via the language files
     (menu.singleplayer/multiplayer/options -> Uno/Dos/Settings),
     prepends ForestX splashes, and regrades the title panorama
     textures from purple to a tranquil green forest,
  4. rebuilds the EPK (only changed entries differ; every CRC is
     recomputed and re-validated), re-embeds it, and updates data-size.

Nothing else in the HTML is touched. Pristine file:
`git show 95207d1:forestx.html`.

Usage: python3 tools/patch_assets.py [INPUT] [OUTPUT] [--no-panorama]
(Panorama regrade needs Pillow: pip install Pillow)
"""
import base64
import gzip
import re
import struct
import sys
import zlib

LABELS = {
    "menu.singleplayer": "Uno - Singleplayer",
    "menu.multiplayer": "Dos - Multiplayer",
    "menu.options": "Settings",
    "options.title": "Settings",
    "title.singleplayer": "Uno - Singleplayer",
    "selectWorld.title": "Uno - Select World",
    "multiplayer.title": "Dos - Play Multiplayer",
}
SPLASHES = [
    "Welcome to ForestX Client!",
    "Uno means singleplayer!",
    "Dos means multiplayer!",
    "Grown in a tranquil forest!",
    "Your name looks good on that hill!",
]
PANORAMAS = [f"assets/minecraft/textures/gui/title/background/panorama_{i}.png" for i in range(6)]


# ---------- EPK (classic ver2.0 layout) ----------
def _read_ascii(buf, pos):
    ln = buf[pos]
    return buf[pos + 1 : pos + 1 + ln], pos + 1 + ln


def _write_ascii(out, raw):
    assert len(raw) < 256, "ascii field too long"
    out.append(len(raw))
    out += raw


def parse_epk(raw):
    if raw[:8] != b"EAGPKG$$" or raw[-8:] != b":::YEE:>":
        raise SystemExit("Not a classic EPK (bad magic/EOF) — aborting")
    s = raw[8:-8]
    pos = 0
    version, pos = _read_ascii(s, pos)
    if not version.startswith(b"ver2."):
        raise SystemExit(f"Unknown EPK version {version!r} — aborting")
    filename, pos = _read_ascii(s, pos)
    clen, = struct.unpack_from(">H", s, pos)
    pos += 2
    comment = s[pos : pos + clen]
    pos += clen
    millis = s[pos : pos + 8]
    pos += 8
    num_files, = struct.unpack_from(">i", s, pos)
    pos += 4
    ctype = chr(s[pos])
    pos += 1
    payload = s[pos:]
    if ctype == "G":
        inner = gzip.decompress(payload)
    elif ctype == "Z":
        inner = zlib.decompress(payload)
    elif ctype == "0":
        inner = payload
    else:
        raise SystemExit(f"Unsupported EPK compression {ctype!r} — aborting")

    entries, p = [], 0
    for _ in range(num_files):
        typ = inner[p : p + 4].decode("latin1")
        p += 4
        if typ == "END$":
            raise SystemExit("Unexpected END$ — corrupt EPK")
        name_b, p = _read_ascii(inner, p)
        name = name_b.decode("latin1")
        ln, = struct.unpack_from(">i", inner, p)
        p += 4
        if typ == "FILE":
            if ln < 5:
                raise SystemExit(f"Entry {name} too short")
            crc, = struct.unpack_from(">I", inner, p)
            p += 4
            data = inner[p : p + ln - 5]
            p += ln - 5
            if inner[p : p + 1] != b":":
                raise SystemExit(f"Entry {name} missing ':' terminator")
            p += 1
            if zlib.crc32(data) & 0xFFFFFFFF != crc:
                raise SystemExit(f"Entry {name} CRC mismatch in source EPK")
        else:
            data = inner[p : p + ln]
            p += ln
        if inner[p : p + 1] != b">":
            raise SystemExit(f"Entry {name} missing '>' terminator")
        p += 1
        entries.append({"type": typ, "name": name, "data": bytes(data)})
    if inner[p : p + 4] != b"END$" or p + 4 != len(inner):
        raise SystemExit("EPK missing END$ or has trailing bytes")
    header = {"version": version, "filename": filename, "comment": comment,
              "millis": millis, "ctype": ctype}
    return header, entries


def build_epk(header, entries):
    inner = bytearray()
    for e in entries:
        typ = e["type"].encode("latin1")
        assert len(typ) == 4
        inner += typ
        _write_ascii(inner, e["name"].encode("latin1"))
        if e["type"] == "FILE":
            data = e["data"]
            inner += struct.pack(">i", len(data) + 5)
            inner += struct.pack(">I", zlib.crc32(data) & 0xFFFFFFFF)
            inner += data
            inner += b":"
        else:
            inner += struct.pack(">i", len(e["data"]))
            inner += e["data"]
        inner += b">"
    inner += b"END$"

    if header["ctype"] == "G":
        payload = gzip.compress(bytes(inner), compresslevel=9, mtime=0)
    elif header["ctype"] == "Z":
        payload = zlib.compress(bytes(inner), 9)
    else:
        payload = bytes(inner)

    out = bytearray(b"EAGPKG$$")
    _write_ascii(out, header["version"])
    _write_ascii(out, header["filename"])
    out += struct.pack(">H", len(header["comment"]))
    out += header["comment"]
    out += header["millis"]
    out += struct.pack(">i", len(entries))
    out += header["ctype"].encode("latin1")
    out += payload
    out += b":::YEE:>"
    return bytes(out)


# ---------- modifications ----------
def patch_lang(text):
    changed = 0
    for key, label in LABELS.items():
        pat = re.compile(r'("' + re.escape(key) + r'"\s*:\s*")(?:\\.|[^"\\])*(")')
        text, n = pat.subn(lambda m: m.group(1) + label + m.group(2), text)
        changed += n
    return text, changed


def _hue_lut():
    pts = [(0, 22), (28, 60), (57, 74), (92, 88), (117, 135), (142, 145),
           (160, 85), (191, 89), (227, 103), (248, 25), (255, 22)]
    lut = []
    for h in range(256):
        for i in range(len(pts) - 1):
            x0, y0 = pts[i]
            x1, y1 = pts[i + 1]
            if x0 <= h <= x1:
                lut.append(int(y0 + (y1 - y0) * (h - x0) / max(1, x1 - x0)))
                break
        else:
            lut.append(h)
    return lut


def regrade_panorama(png_bytes):
    from PIL import Image, ImageEnhance  # local: only needed for this step
    import io

    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    hsv = im.convert("HSV")
    h, s, v = hsv.split()
    h = h.point(_hue_lut())
    s = s.point(lambda x: int(x * 0.84))
    v = v.point(lambda x: min(255, int((x / 255) ** 0.82 * 255) + 8))
    out = Image.merge("HSV", (h, s, v)).convert("RGB")
    out = ImageEnhance.Color(out).enhance(1.03)
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def modify(entries, do_panorama):
        changed = []
        by_name = {e["name"]: e for e in entries if e["type"] == "FILE"}
        en = by_name.get("assets/minecraft/lang/en_us.json")
        if en and b'"Uno - Singleplayer"' in en["data"]:
            return None  # already patched
        for e in entries:
            if e["type"] != "FILE":
                continue
            name = e["name"]
            if re.fullmatch(r"assets/(?:minecraft|eagler)/lang/[^/]+\.json", name):
                new_text, n = patch_lang(e["data"].decode("utf-8"))
                if n:
                    e["data"] = new_text.encode("utf-8")
                    changed.append(name)
            elif name == "assets/minecraft/texts/splashes.txt":
                old = e["data"].decode("utf-8")
                if not old.startswith(SPLASHES[0]):
                    e["data"] = ("\n".join(SPLASHES) + "\n" + old).encode("utf-8")
                    changed.append(name)
            elif do_panorama and name in PANORAMAS:
                e["data"] = regrade_panorama(e["data"])
                changed.append(name)
        return changed


# ---------- HTML payload ----------
PAYLOAD_RE = re.compile(
    r'(<script type="application/octet-stream" id="eag-inline-assets" data-size=")(\d+)(">)(.*?)(</script>)',
    re.DOTALL,
)


def patch_html(html, do_panorama):
    m = PAYLOAD_RE.search(html)
    if not m:
        raise SystemExit("eag-inline-assets payload not found — aborting")
    declared = int(m.group(2))
    b64_clean = re.sub(r"\s", "", m.group(4))
    raw = base64.b64decode(b64_clean, validate=True)
    if len(raw) != declared:
        raise SystemExit(f"Payload size mismatch: decoded {len(raw)} != data-size {declared}")

    header, entries = parse_epk(raw)
    before = {e["name"]: e["data"] for e in entries if e["type"] == "FILE"}
    changed = modify(entries, do_panorama)
    if changed is None:
        print("Assets already patched (Uno labels present) — nothing to do.")
        return html, []
    if not changed:
        raise SystemExit("No entries changed — aborting (unexpected layout)")

    rebuilt = build_epk(header, entries)

    # Re-validate the rebuilt pack end-to-end
    _, check = parse_epk(rebuilt)
    if len(check) != len(entries):
        raise SystemExit("Rebuild entry count mismatch")
    for old_e, new_e in zip(entries, check):
        if old_e["name"] != new_e["name"] or old_e["type"] != new_e["type"] or old_e["data"] != new_e["data"]:
            raise SystemExit(f"Rebuild mismatch at {old_e['name']}")
    for e in check:
        if e["type"] == "FILE" and e["name"] not in changed and before.get(e["name"]) != e["data"]:
            raise SystemExit(f"Unintended change to {e['name']}")

    # Re-embed, preserving the original wrap width if it had one
    content = m.group(4).lstrip()
    first_nl = content.find("\n")
    wrap = first_nl if 0 < first_nl <= 262144 and first_nl % 4 == 0 else 0
    b64 = base64.b64encode(rebuilt).decode("ascii")
    if wrap:
        b64 = "\n".join(b64[i : i + wrap] for i in range(0, len(b64), wrap))
    replacement = f"{m.group(1)}{len(rebuilt)}{m.group(3)}\n{b64}\n{m.group(5)}"
    return html[: m.start()] + replacement + html[m.end():], changed


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    do_panorama = "--no-panorama" not in sys.argv
    inp = args[0] if len(args) > 0 else "forestx.html"
    out = args[1] if len(args) > 1 else inp
    html = open(inp, "rb").read().decode("utf-8")
    result, changed = patch_html(html, do_panorama)
    open(out, "wb").write(result.encode("utf-8"))
    print(f"Assets patched in {out}: {len(changed)} entries changed")
    for c in changed:
        print("  -", c)
    print(f"HTML size: {len(html.encode('utf-8')):,} -> {len(result.encode('utf-8')):,}")


if __name__ == "__main__":
    main()
