#!/usr/bin/env python3
"""Render a story share card.

Writes a 1200x630 PNG. The default story is 01 (Jim Morrison), which keeps
the original output path and the original four lines.

Colors are read from the :root custom properties in styles.css, which match
the theme object in site.json. Titles use EB Garamond (styles.css --display).
The kicker, third line, and footer use Inter (styles.css --ui). Both families
are bundled, unmodified, under scripts/fonts and are licensed under the SIL
Open Font License, Version 1.1 (see the OFL.txt beside each family).

Each card is text only: the lines specified for that story, and no
photographs, portraits, likenesses, or memorial imagery.

Requires Pillow. From the repo root:

    python3 scripts/make_story_card.py
    python3 scripts/make_story_card.py 02
    python3 scripts/make_story_card.py 03
    python3 scripts/make_story_card.py 04
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "styles.css"
FONT_DIR = Path(__file__).resolve().parent / "fonts"
GARAMOND_PATH = FONT_DIR / "eb-garamond" / "EBGaramond[wght].ttf"
INTER_MEDIUM_PATH = FONT_DIR / "inter" / "Inter-Medium.ttf"
INTER_REGULAR_PATH = FONT_DIR / "inter" / "Inter-Regular.ttf"

WIDTH = 1200
HEIGHT = 630
FOOTER = "27chat \u2014 The work didn't stop."

# Card copy is the cleared line spec for each story. Story 01's title is
# wrapped; the words and their order are unchanged. Stories 02, 03 and 04 use
# the single large line and the third line from their META card specs.
STORIES = {
    "01": {
        "out": ROOT / "stories" / "01-jim-morrison-paris" / "card.png",
        "kicker": "STORY 01",
        "title": "How Jim Morrison Came to Rest in Paris",
        "title_lines": ("How Jim Morrison", "Came to Rest in Paris"),
        "dateline": "Paris, 1971 \u00b7 P\u00e8re Lachaise",
    },
    "02": {
        "out": ROOT / "stories" / "02-amy-winehouse" / "card.png",
        "kicker": "STORY 02",
        "title": "Amy Winehouse's Music",
        "title_lines": ("Amy Winehouse's Music",),
        "dateline": "Frank \u00b7 Back to Black \u00b7 Lioness",
    },
    "03": {
        "out": ROOT / "stories" / "03-jimi-hendrix" / "card.png",
        "kicker": "STORY 03",
        "title": "Jimi Hendrix's Work",
        "title_lines": ("Jimi Hendrix's Work",),
        "dateline": "London \u00b7 Monterey \u00b7 Electric Lady",
    },
    "04": {
        "out": ROOT / "stories" / "04-robert-johnson" / "card.png",
        "kicker": "STORY 04",
        "title": "Robert Johnson's Work",
        "title_lines": ("Robert Johnson's Work",),
        "dateline": "San Antonio 1936 \u00b7 Dallas 1937 \u00b7 29 Songs",
    },
}

assert STORIES["01"]["dateline"] == "Paris, 1971 \u00b7 P\u00e8re Lachaise"
assert STORIES["02"]["dateline"] == "Frank \u00b7 Back to Black \u00b7 Lioness"
assert STORIES["03"]["dateline"] == "London \u00b7 Monterey \u00b7 Electric Lady"
assert STORIES["04"]["dateline"] == "San Antonio 1936 \u00b7 Dallas 1937 \u00b7 29 Songs"
assert FOOTER == "27chat \u2014 The work didn't stop."
assert "\u2019" not in FOOTER
for spec in STORIES.values():
    assert " ".join(spec["title_lines"]) == spec["title"]
    assert "\u2019" not in spec["title"]


def theme_colors(css_path: Path) -> dict[str, str]:
    text = css_path.read_text(encoding="utf-8")
    match = re.search(r":root\s*\{([^}]*)\}", text)
    if not match:
        raise SystemExit(f"no :root block in {css_path}")
    colors = {
        name: value
        for name, value in re.findall(
            r"--([A-Za-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{6})\b",
            match.group(1),
        )
    }
    required = ("bg", "nav-bg", "text", "text-muted", "accent", "border")
    missing = [name for name in required if name not in colors]
    if missing:
        raise SystemExit(f"{css_path} :root is missing {', '.join(missing)}")
    return colors


def rgb(hex_color: str) -> tuple[int, int, int]:
    channel = hex_color[1:]
    return int(channel[0:2], 16), int(channel[2:4], 16), int(channel[4:6], 16)


def garamond(size: int, weight: int = 600) -> ImageFont.FreeTypeFont:
    font = ImageFont.truetype(str(GARAMOND_PATH), size)
    font.set_variation_by_axes([weight])
    return font


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> float:
    return draw.textlength(text, font=font)


def draw_tracked(
    draw: ImageDraw.ImageDraw,
    origin: tuple[float, float],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    tracking: float,
) -> None:
    x, y = origin
    for character in text:
        draw.text((x, y), character, font=font, fill=fill, anchor="ls")
        x += draw.textlength(character, font=font) + tracking


def fit_title(
    draw: ImageDraw.ImageDraw, title_lines: tuple[str, ...], max_width: float
) -> tuple[ImageFont.FreeTypeFont, int]:
    for size in range(92, 47, -1):
        font = garamond(size, 600)
        widest = max(text_width(draw, line, font) for line in title_lines)
        if widest <= max_width:
            return font, size
    raise SystemExit("title does not fit the card")


def render(story_id: str) -> None:
    spec = STORIES[story_id]
    title_lines: tuple[str, ...] = spec["title_lines"]
    kicker = spec["kicker"]
    dateline = spec["dateline"]
    out_path: Path = spec["out"]

    colors = theme_colors(CSS_PATH)
    background = rgb(colors["bg"])
    nav = rgb(colors["nav-bg"])
    ink = rgb(colors["text"])
    muted = rgb(colors["text-muted"])
    accent = rgb(colors["accent"])
    border = rgb(colors["border"])

    image = Image.new("RGB", (WIDTH, HEIGHT), background)
    draw = ImageDraw.Draw(image)

    pad_left = 84
    pad_right = 76
    max_width = WIDTH - pad_left - pad_right
    footer_band = 104

    kicker_size = 22
    kicker_font = ImageFont.truetype(str(INTER_MEDIUM_PATH), kicker_size)
    kicker_tracking = 5.5
    title_font, title_size = fit_title(draw, title_lines, max_width)
    dateline_font = ImageFont.truetype(str(INTER_REGULAR_PATH), 28)
    footer_font = ImageFont.truetype(str(INTER_MEDIUM_PATH), 24)

    if text_width(draw, dateline, dateline_font) > max_width:
        raise SystemExit("dateline does not fit the card")
    if text_width(draw, FOOTER, footer_font) > max_width:
        raise SystemExit("footer does not fit the card")

    kicker_ascent, _kicker_descent = kicker_font.getmetrics()
    title_ascent, title_descent = title_font.getmetrics()
    date_ascent, date_descent = dateline_font.getmetrics()
    title_gap = int(round(title_size * 0.18))
    stack_gaps = (26, 32, 40)

    if len(title_lines) == 2:
        title_block = (
            title_ascent
            + title_descent
            + title_gap
            + title_ascent
            + title_descent
        )
    elif len(title_lines) == 1:
        title_block = title_ascent + title_descent
    else:
        raise SystemExit("card title must be 1 or 2 lines")

    stack_height = (
        kicker_ascent
        + stack_gaps[0]
        + 3
        + stack_gaps[1]
        + title_block
        + stack_gaps[2]
        + date_ascent
        + date_descent
    )
    content_bottom = HEIGHT - footer_band
    top = max(56, (content_bottom - stack_height) // 2)

    # Active-nav rail from the site chrome. Typographic, not pictorial.
    draw.rectangle((0, 0, 7, HEIGHT), fill=accent)

    y = top + kicker_ascent
    draw_tracked(draw, (pad_left, y), kicker, kicker_font, accent, kicker_tracking)
    y += stack_gaps[0]
    draw.rectangle((pad_left, y, pad_left + 72, y + 3), fill=accent)
    y += 3 + stack_gaps[1] + title_ascent

    for index, line in enumerate(title_lines):
        draw.text((pad_left, y), line, font=title_font, fill=ink, anchor="ls")
        if index < len(title_lines) - 1:
            y += title_descent + title_gap + title_ascent
    y += title_descent + stack_gaps[2] + date_ascent
    draw.text((pad_left, y), dateline, font=dateline_font, fill=muted, anchor="ls")

    band_top = HEIGHT - footer_band
    draw.rectangle((0, band_top, WIDTH, HEIGHT), fill=nav)
    draw.rectangle((0, band_top, WIDTH, band_top + 1), fill=border)
    draw.rectangle((0, band_top, 7, HEIGHT), fill=accent)

    brand = "27chat"
    rest = FOOTER[len(brand) :]
    if brand + rest != FOOTER:
        raise SystemExit("footer split does not match the specified line")
    footer_ascent, footer_descent = footer_font.getmetrics()
    footer_baseline = band_top + (footer_band + footer_ascent - footer_descent) / 2
    draw.text((pad_left, footer_baseline), brand, font=footer_font, fill=accent, anchor="ls")
    brand_width = text_width(draw, brand, footer_font)
    draw.text(
        (pad_left + brand_width, footer_baseline),
        rest,
        font=footer_font,
        fill=ink,
        anchor="ls",
    )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(out_path, "PNG", optimize=True)
    print(
        f"wrote {out_path.relative_to(ROOT)} {image.size[0]}x{image.size[1]} "
        f"title {title_size}px"
    )


def main() -> None:
    story_id = sys.argv[1] if len(sys.argv) > 1 else "01"
    if story_id not in STORIES:
        raise SystemExit(f"unknown story {story_id!r}; choose from {', '.join(STORIES)}")
    render(story_id)


if __name__ == "__main__":
    main()
