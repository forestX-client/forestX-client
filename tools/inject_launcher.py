#!/usr/bin/env python3
"""Inject the ForestX launcher into the single-file Eaglercraft client.

Usage:
    python3 tools/inject_launcher.py [INPUT] [SNIPPET] [OUTPUT]

Defaults: forestx.html  launcher/forestx-launcher.snippet.html  (in-place)

The snippet is inserted as ONE contiguous block right after the opening
<body ...> tag, between FORESTX-LAUNCHER:BEGIN / :END markers. Re-running
replaces any previous block, and removing the block reproduces the pristine
client byte-for-byte (nothing else in the file is touched).
"""
import re
import sys

BEGIN = "<!-- FORESTX-LAUNCHER:BEGIN"
END = "<!-- FORESTX-LAUNCHER:END -->"


def strip_block(html: str) -> str:
    """Remove an existing launcher block (plus the newline injected before it),
    restoring the pristine file byte-for-byte."""
    i = html.find(BEGIN)
    if i == -1:
        return html
    j = html.find(END, i)
    if j == -1:
        raise SystemExit("Found BEGIN marker without END — refusing to modify file")
    start = i - 1 if i > 0 and html[i - 1] == "\n" else i
    return html[:start] + html[j + len(END):]


def inject(html: str, snippet: str) -> str:
    html = strip_block(html)
    m = re.search(r"<body\b[^>]*>", html, re.IGNORECASE)
    if not m:
        raise SystemExit("No <body> tag found in input — aborting")
    if BEGIN not in snippet or END not in snippet:
        raise SystemExit("Snippet is missing BEGIN/END markers — aborting")
    return html[: m.end()] + "\n" + snippet.rstrip("\n") + html[m.end():]


def main() -> None:
    inp = sys.argv[1] if len(sys.argv) > 1 else "forestx.html"
    snip = sys.argv[2] if len(sys.argv) > 2 else "launcher/forestx-launcher.snippet.html"
    out = sys.argv[3] if len(sys.argv) > 3 else inp

    with open(inp, "rb") as f:
        html = f.read().decode("utf-8")
    with open(snip, "rb") as f:
        snippet = f.read().decode("utf-8")

    result = inject(html, snippet)
    with open(out, "wb") as f:
        f.write(result.encode("utf-8"))

    added = len(result.encode("utf-8")) - len(html.encode("utf-8"))
    print(f"Injected launcher into {out}: {added:+,} bytes "
          f"({len(html.encode('utf-8')):,} -> {len(result.encode('utf-8')):,})")


if __name__ == "__main__":
    main()
