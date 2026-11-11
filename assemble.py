#!/usr/bin/env python3
"""
Assemble ForestX client from 4 split parts.

Usage:
  python assemble.py forestx-v29p1.html forestx-v29p2.html forestx-v29p3.html forestx-v29p4.html -o forestx.html

The split files are raw byte slices of the original single-file client HTML (~80-90MB).
Just concatenating them in order (p1+p2+p3+p4) restores the original file.
If your parts are base64-encoded chunks, use --b64 flag.
"""
import argparse, pathlib, sys

def main():
    ap = argparse.ArgumentParser(description="Assemble ForestX client")
    ap.add_argument("parts", nargs="+", help="part files in order p1 p2 p3 p4")
    ap.add_argument("-o", "--output", default="forestx.html", help="output file")
    ap.add_argument("--b64", action="store_true", help="parts are base64 text that decodes to original")
    args = ap.parse_args()

    out = pathlib.Path(args.output)
    if args.b64:
        import base64
        combined_b64 = ""
        for p in args.parts:
            text = pathlib.Path(p).read_text(encoding="utf-8", errors="ignore")
            combined_b64 += text.strip().replace("\n","").replace("\r","").replace(" ","")
        print(f"combined base64 len {len(combined_b64):,}")
        data = base64.b64decode(combined_b64)
        # try to detect compression
        if data[:2] == b"\x1f\x8b":
            import gzip
            data = gzip.decompress(data)
            print("gzip decompressed")
        out.write_bytes(data)
        print(f"wrote {out} ({len(data):,} bytes)")
    else:
        # raw concat
        with out.open("wb") as fw:
            total=0
            for p in args.parts:
                b = pathlib.Path(p).read_bytes()
                fw.write(b)
                total+=len(b)
                print(f"  {p}: {len(b):,} bytes")
        print(f"wrote {out} ({total:,} bytes)")
        # quick sanity
        head = out.read_bytes()[:200]
        print(f"head preview: {head[:120]!r}")
        if b"ForestX" in out.read_bytes()[:5_000_000]:
            print("✓ ForestX marker found")
        else:
            print("⚠ ForestX marker not in first 5MB — check part order", file=sys.stderr)

if __name__ == "__main__":
    main()
