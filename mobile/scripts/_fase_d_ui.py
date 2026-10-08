"""Fase D UI helper. Not product code. Serial via ANDROID_SERIAL or argv."""
from __future__ import annotations

import os
import re
import subprocess
import sys
import time
from pathlib import Path

DEFAULT_SERIAL = os.environ.get("ANDROID_SERIAL", "emulator-5554")
DUMP_DIR = Path(r"C:\Users\JuanC\Desktop\MIAyudaTics\fase-d-evidence")
DUMP_DIR.mkdir(parents=True, exist_ok=True)


def adb_bin(serial: str) -> list[str]:
    return ["adb", "-s", serial]


def run(args: list[str], check: bool = True, timeout: int = 30) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, check=check, text=True, capture_output=True, timeout=timeout)


def dump(serial: str) -> str:
    dest = DUMP_DIR / f"uidump-{serial}.xml"
    run(adb_bin(serial) + ["shell", "uiautomator", "dump", "/sdcard/uidump.xml"])
    run(adb_bin(serial) + ["pull", "/sdcard/uidump.xml", str(dest)])
    return dest.read_text(encoding="utf-8", errors="replace")


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
                "focused": g("focused"),
                "hint": g("hint"),
                "bounds": b.groups() if b else ("0", "0", "0", "0"),
            }
        )
    return out


def center(bounds: tuple[str, str, str, str]) -> tuple[int, int]:
    x1, y1, x2, y2 = map(int, bounds)
    return (x1 + x2) // 2, (y1 + y2) // 2


def tap(serial: str, x: int, y: int) -> None:
    run(adb_bin(serial) + ["shell", "input", "tap", str(x), str(y)])


def find(xml: str, needle: str, clickable_only: bool = False):
    nlow = needle.lower()
    for n in nodes(xml):
        hay = f"{n['text']} {n['desc']} {n['hint']}".lower()
        if nlow in hay and (not clickable_only or n["clickable"] == "true"):
            return n
    return None


def visible_texts(xml: str) -> list[str]:
    out = []
    for n in nodes(xml):
        for key in ("text", "desc"):
            if n[key]:
                out.append(n[key])
    return out


def wait_text(serial: str, needle: str, timeout: float = 20.0) -> str:
    deadline = time.time() + timeout
    last = ""
    while time.time() < deadline:
        last = dump(serial)
        if find(last, needle):
            return last
        time.sleep(0.8)
    print(f"TIMEOUT waiting {needle!r}")
    print("VISIBLE", visible_texts(last)[:50])
    raise SystemExit(2)


def tap_text(serial: str, needle: str, clickable_only: bool = False, wait: float = 0.9) -> bool:
    xml = dump(serial)
    n = find(xml, needle, clickable_only=clickable_only) or find(xml, needle, clickable_only=False)
    if not n:
        print(f"NOT_FOUND {needle!r}")
        print("VISIBLE", visible_texts(xml)[:50])
        return False
    x, y = center(n["bounds"])
    print(f"TAP {needle!r} -> {x},{y} text={n['text']!r} desc={n['desc']!r}")
    tap(serial, x, y)
    time.sleep(wait)
    return True


def tap_edittexts(serial: str, index: int) -> bool:
    xml = dump(serial)
    edits = [n for n in nodes(xml) if "EditText" in n["cls"]]
    if index >= len(edits):
        print(f"EDITTEXT_MISSING index={index} count={len(edits)}")
        return False
    x, y = center(edits[index]["bounds"])
    print(f"TAP EditText[{index}] -> {x},{y}")
    tap(serial, x, y)
    time.sleep(0.4)
    return True


def clear_focused(serial: str, n: int = 48) -> None:
    run(adb_bin(serial) + ["shell", "input", "keyevent", "123"])
    for _ in range(n):
        run(adb_bin(serial) + ["shell", "input", "keyevent", "67"])


def type_text(serial: str, value: str) -> None:
    escaped = (
        value.replace("\\", "\\\\")
        .replace(" ", "%s")
        .replace("'", "\\'")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("&", "\\&")
        .replace("<", "\\<")
        .replace(">", "\\>")
        .replace("|", "\\|")
        .replace(";", "\\;")
        .replace("*", "\\*")
        .replace("~", "\\~")
        .replace('"', '\\"')
    )
    escaped = escaped.replace("@", "\\@")
    run(adb_bin(serial) + ["shell", "input", "text", escaped])
    time.sleep(0.3)


def screenshot(serial: str, name: str) -> Path:
    dest = DUMP_DIR / f"{serial}-{name}.png"
    with dest.open("wb") as fh:
        subprocess.run(adb_bin(serial) + ["exec-out", "screencap", "-p"], check=True, stdout=fh)
    print("SHOT", dest.name)
    return dest


def extract_codes(xml: str) -> list[str]:
    return re.findall(r"\d{4}-\d{2}-\d{5}", xml)


def keyevent(serial: str, code: str | int) -> None:
    run(adb_bin(serial) + ["shell", "input", "keyevent", str(code)])


def swipe(serial: str, x1: int, y1: int, x2: int, y2: int, ms: int = 400) -> None:
    run(adb_bin(serial) + ["shell", "input", "swipe", str(x1), str(y1), str(x2), str(y2), str(ms)])


def main() -> None:
    serial = DEFAULT_SERIAL
    args = sys.argv[1:]
    if args and args[0].startswith("emulator-") or (args and args[0] == "RF8MB3BNP5V"):
        serial = args[0]
        args = args[1:]
    if not args:
        raise SystemExit("usage: _fase_d_ui.py [serial] list|tap|wait|type|shot|codes|edit|clear|back|swipe")
    cmd = args[0]
    if cmd == "list":
        xml = dump(serial)
        for n in nodes(xml):
            if n["text"] or n["desc"] or n["hint"]:
                print(n["clickable"], n["bounds"], repr(n["text"]), repr(n["desc"]), repr(n["hint"]), n["cls"])
    elif cmd == "tap":
        ok = tap_text(serial, " ".join(args[1:]))
        sys.exit(0 if ok else 2)
    elif cmd == "wait":
        wait_text(serial, " ".join(args[1:]), timeout=float(os.environ.get("WAIT_S", "25")))
        print("FOUND")
    elif cmd == "type":
        type_text(serial, " ".join(args[1:]))
    elif cmd == "shot":
        screenshot(serial, args[1] if len(args) > 1 else "shot")
    elif cmd == "codes":
        xml = dump(serial)
        print("CODES", ",".join(extract_codes(xml)) or "none")
        print("VISIBLE", visible_texts(xml)[:60])
    elif cmd == "edit":
        ok = tap_edittexts(serial, int(args[1]))
        sys.exit(0 if ok else 2)
    elif cmd == "clear":
        clear_focused(serial)
    elif cmd == "back":
        keyevent(serial, 4)
    elif cmd == "swipe":
        swipe(serial, *map(int, args[1:6] if len(args) > 5 else args[1:5] + [400]))
    else:
        raise SystemExit(f"unknown {cmd}")


if __name__ == "__main__":
    main()
