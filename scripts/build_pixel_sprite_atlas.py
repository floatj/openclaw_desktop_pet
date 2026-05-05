#!/usr/bin/env python3
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "references/pixel_sprite/strips/raw"
PROCESSED_DIR = ROOT / "references/pixel_sprite/strips/processed"
APP_ASSET = ROOT / "src/2d/assets/npc-rabbit-strip-atlas.png"

FRAME = 256
ATLAS_COLS = 6
MAX_FRAME_W = 232
MAX_FRAME_H = 224
BASELINE_Y = 240

ROWS = [
    ("idle", 4, 250),
    ("idle_look", 4, 500),
    ("happy", 6, 150),
    ("speak", 4, 300),
    ("think", 4, 500),
    ("sleep", 4, 800),
    ("angry", 4, 250),
    ("shy", 4, 400),
    ("walk_right", 6, 120),
    ("walk_left", 6, 120),
    ("sit_down", 4, 333),
    ("coding", 4, 180),
]

PRESIZED_STRIPS = {
    "coding": PROCESSED_DIR / "coding-highres-strip.png",
}


def is_key_green(pixel):
    r, g, b, a = pixel
    return a and g > 45 and g > r + 12 and g > b + 12


def strip_chroma(img):
    img = img.convert("RGBA")
    pix = img.load()
    for y in range(img.height):
        for x in range(img.width):
            if is_key_green(pix[x, y]):
                pix[x, y] = (255, 255, 255, 0)
    return img


def crop_content(img):
    bbox = img.getchannel("A").getbbox()
    if not bbox:
        return None
    return img.crop(bbox)


def remove_artifacts(img):
    img = img.convert("RGBA")
    pix = img.load()
    width, height = img.size
    seen = set()

    for y in range(height):
        for x in range(width):
            if (x, y) in seen or pix[x, y][3] == 0:
                continue

            stack = [(x, y)]
            seen.add((x, y))
            pixels = []
            while stack:
                cx, cy = stack.pop()
                pixels.append((cx, cy))
                for nx in (cx - 1, cx, cx + 1):
                    for ny in (cy - 1, cy, cy + 1):
                        if nx < 0 or ny < 0 or nx >= width or ny >= height:
                            continue
                        if (nx, ny) in seen or pix[nx, ny][3] == 0:
                            continue
                        seen.add((nx, ny))
                        stack.append((nx, ny))

            xs = [point[0] for point in pixels]
            ys = [point[1] for point in pixels]
            comp_w = max(xs) - min(xs) + 1
            comp_h = max(ys) - min(ys) + 1
            area = len(pixels)
            is_thin_speck = comp_w <= 8 and comp_h >= 14 and area < 260
            is_tiny_speck = area < 35
            if is_thin_speck or is_tiny_speck:
                for px, py in pixels:
                    pix[px, py] = (255, 255, 255, 0)

    return img


def extract_frames(strip, frame_count):
    frames = []
    band_w = strip.width / frame_count
    for index in range(frame_count):
        left = int(round(index * band_w))
        right = int(round((index + 1) * band_w))
        band = strip.crop((left, 0, right, strip.height))
        frames.append(crop_content(remove_artifacts(band)))
    return frames


def render_row(frames):
    row = Image.new("RGBA", (ATLAS_COLS * FRAME, FRAME), (255, 255, 255, 0))
    valid = [frame for frame in frames if frame is not None]
    if not valid:
        return row

    max_w = max(frame.width for frame in valid)
    max_h = max(frame.height for frame in valid)
    scale = min(MAX_FRAME_W / max_w, MAX_FRAME_H / max_h)

    for index, frame in enumerate(frames):
        if frame is None:
            continue
        width = max(1, round(frame.width * scale))
        height = max(1, round(frame.height * scale))
        scaled = frame.resize((width, height), Image.Resampling.LANCZOS)
        x = index * FRAME + (FRAME - width) // 2
        y = BASELINE_Y - height
        y = max(2, min(FRAME - height - 2, y))
        row.alpha_composite(scaled, (x, y))
    return row


def render_presized_strip(strip, frame_count):
    row = Image.new("RGBA", (ATLAS_COLS * FRAME, FRAME), (255, 255, 255, 0))
    strip = strip.convert("RGBA")
    for index in range(frame_count):
        frame = strip.crop((index * FRAME, 0, (index + 1) * FRAME, FRAME))
        row.alpha_composite(frame, (index * FRAME, 0))
    return row


def clean_final_atlas(atlas):
    pix = atlas.load()
    width, height = atlas.size
    seen = set()

    for y in range(height):
        for x in range(width):
            if (x, y) in seen or pix[x, y][3] == 0:
                continue

            stack = [(x, y)]
            seen.add((x, y))
            pixels = []
            while stack:
                cx, cy = stack.pop()
                pixels.append((cx, cy))
                for nx in (cx - 1, cx, cx + 1):
                    for ny in (cy - 1, cy, cy + 1):
                        if nx < 0 or ny < 0 or nx >= width or ny >= height:
                            continue
                        if (nx, ny) in seen or pix[nx, ny][3] == 0:
                            continue
                        seen.add((nx, ny))
                        stack.append((nx, ny))

            xs = [point[0] for point in pixels]
            ys = [point[1] for point in pixels]
            comp_w = max(xs) - min(xs) + 1
            comp_h = max(ys) - min(ys) + 1
            area = len(pixels)
            if comp_w <= 12 and comp_h >= 10 and area < 320:
                for px, py in pixels:
                    pix[px, py] = (255, 255, 255, 0)

    return atlas


def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    APP_ASSET.parent.mkdir(parents=True, exist_ok=True)

    atlas = Image.new("RGBA", (ATLAS_COLS * FRAME, len(ROWS) * FRAME), (255, 255, 255, 0))
    meta = {"frameSize": {"w": FRAME, "h": FRAME}, "animations": {}}

    for row_index, (name, frame_count, ms_per_frame) in enumerate(ROWS):
        if name in PRESIZED_STRIPS and PRESIZED_STRIPS[name].exists():
            rendered = render_presized_strip(Image.open(PRESIZED_STRIPS[name]), frame_count)
        else:
            source = RAW_DIR / f"{name}.png"
            if not source.exists():
                raise FileNotFoundError(source)

            strip = strip_chroma(Image.open(source))
            frames = extract_frames(strip, frame_count)
            rendered = render_row(frames)
        rendered.save(PROCESSED_DIR / f"{name}.png")
        atlas.alpha_composite(rendered, (0, row_index * FRAME))
        meta["animations"][name] = {
            "row": row_index,
            "frames": frame_count,
            "msPerFrame": ms_per_frame,
            "loop": True,
        }

    atlas = clean_final_atlas(atlas)
    for row_index, (name, frame_count, _) in enumerate(ROWS):
        if name in PRESIZED_STRIPS and PRESIZED_STRIPS[name].exists():
            rendered = render_presized_strip(Image.open(PRESIZED_STRIPS[name]), frame_count)
            atlas.paste((255, 255, 255, 0), (0, row_index * FRAME, ATLAS_COLS * FRAME, (row_index + 1) * FRAME))
            atlas.alpha_composite(rendered, (0, row_index * FRAME))

    atlas_path = PROCESSED_DIR / "npc_rabbit_strip_atlas_1536x3072.png"
    meta_path = PROCESSED_DIR / "sprite_meta.json"
    atlas.save(atlas_path)
    atlas.save(APP_ASSET)
    meta_path.write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")
    print(atlas_path)
    print(APP_ASSET)
    print(meta_path)


if __name__ == "__main__":
    main()
