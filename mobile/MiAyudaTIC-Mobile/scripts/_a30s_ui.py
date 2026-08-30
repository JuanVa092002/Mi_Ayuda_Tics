"""Temporary A30s UI helper for E2E. Not product code."""
from __future__ import annotations

import re
import subprocess
import sys
import time
from pathlib import Path

SERIAL = "RF8MB3BNP5V"
DUMP = Path(r"C:\Users\JuanC\Desktop\MIAyudaTics\uidump.xml")
ADB = ["adb", "-s", SERIAL]


def run(args: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, check=check, text=True, capture_output=True)


def dump() -> str:
    run(ADB + ["shell", "uiautomator", "dump", "/sdcard/uidump.xml"])
    run(ADB + ["pull", "/sdcard/uidump.xml", str(DUMP)])
    return DUMP.read_text(encoding="utf-8", errors="replace")


def nodes(xml: str) -> list[dict[str, str]]:
    out = []
    for raw in re.findall(r"<node [^>]*>", xml):
        def g(attr: str) -> str:
            m = re.search(rf'{attr}="([^"]*)"', raw)
            return m.group(1) if m else ""

        b = re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"', raw)
        out.append(
            {
                "text": g("text"),
                "desc": g("content-desc"),
                "cls": g("class"),
                "clickable": g("clickable"),
                "bounds": b.groups() if b else ("0", "0", "0", "0"),
            }
        )
    return out


def center(bounds: tuple[str, str, str, str]) -> tuple[int, int]:
    x1, y1, x2, y2 = map(int, bounds)
    return (x1 + x2) // 2, (y1 + y2) // 2


def tap(x: int, y: int) -> None:
    run(ADB + ["shell", "input", "tap", str(x), str(y)])


def find(xml: str, needle: str, clickable_only: bool = False):
    nlow = needle.lower()
    for n in nodes(xml):
        hay = f"{n['text']} {n['desc']}".lower()
        if nlow in hay and (not clickable_only or n["clickable"] == "true"):
            return n
    return None


def tap_text(needle: str, clickable_only: bool = False, wait: float = 0.8) -> bool:
    xml = dump()
    n = find(xml, needle, clickable_only=clickable_only) or find(xml, needle, clickable_only=False)
    if not n:
        print(f"NOT_FOUND {needle!r}")
        visible = [
            f"{x['text']}|{x['desc']}"
            for x in nodes(xml)
            if x["text"] or x["desc"]
        ]
        print("VISIBLE", visible[:40])
        return False
    x, y = center(n["bounds"])
    print(f"TAP {needle!r} -> {x},{y} text={n['text']!r} desc={n['desc']!r}")
    tap(x, y)
    time.sleep(wait)
    return True


def list_visible() -> None:
    xml = dump()
    for n in nodes(xml):
        if n["text"] or n["desc"]:
            print(n["clickable"], n["bounds"], repr(n["text"]), repr(n["desc"]))


def main() -> None:
    cmd = sys.argv[1]
    if cmd == "list":
        list_visible()
    elif cmd == "tap":
        ok = tap_text(" ".join(sys.argv[2:]), clickable_only=False)
        sys.exit(0 if ok else 2)
    elif cmd == "screenshot":
        dest = sys.argv[2]
        raw = run(ADB + ["exec-out", "screencap", "-p"]).stdout.encode("latin1") if False else None
        subprocess.run(ADB + ["exec-out", "screencap", "-p"], check=True, stdout=open(dest, "wb"))
        print("SHOT", dest)
    else:
        raise SystemExit(f"unknown {cmd}")


if __name__ == "__main__":
    main()
