#!/usr/bin/env python3
"""Generate lightweight, non-representational ARF concept films.

The outputs are intentionally abstract. They visualize the company's technology
architecture without presenting stock footage as completed ARF work.
"""

from __future__ import annotations

import math
import shutil
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "media"
WIDTH = 1280
HEIGHT = 720
FPS = 24
SECONDS = 6
FRAME_COUNT = FPS * SECONDS

INK = (16, 42, 58)
RED = (211, 10, 10)
TEAL = (39, 145, 116)
SKY = (83, 157, 198)
AMBER = (232, 169, 58)


def mix(a: tuple[int, int, int], b: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a[index] * (1 - amount) + b[index] * amount) for index in range(3))


@lru_cache(maxsize=3)
def background(accent: tuple[int, int, int]) -> Image.Image:
    start = (248, 250, 247)
    end = mix((232, 241, 237), accent, 0.08)
    image = Image.new("RGB", (WIDTH, HEIGHT))
    pixels = image.load()
    for y in range(HEIGHT):
        y_amount = y / (HEIGHT - 1)
        for x in range(WIDTH):
            x_amount = x / (WIDTH - 1)
            amount = min(1, 0.2 + 0.46 * x_amount + 0.16 * y_amount)
            pixels[x, y] = mix(start, end, amount)
    return image


def hex_points(cx: float, cy: float, radius: float, rotation: float = -math.pi / 2) -> list[tuple[float, float]]:
    return [
        (
            cx + radius * math.cos(rotation + index * math.pi / 3),
            cy + radius * math.sin(rotation + index * math.pi / 3),
        )
        for index in range(6)
    ]


def line_point(points: list[tuple[float, float]], progress: float) -> tuple[float, float]:
    progress = progress % 1
    segment = progress * (len(points) - 1)
    index = min(len(points) - 2, int(segment))
    amount = segment - index
    x1, y1 = points[index]
    x2, y2 = points[index + 1]
    return x1 + (x2 - x1) * amount, y1 + (y2 - y1) * amount


def draw_grid(image: Image.Image, accent: tuple[int, int, int], phase: float) -> None:
    draw = ImageDraw.Draw(image, "RGBA")
    for x in range(40, WIDTH, 56):
        for y in range(34, HEIGHT, 56):
            pulse = (math.sin(phase * math.tau + x * 0.012 + y * 0.009) + 1) / 2
            alpha = round(12 + 14 * pulse)
            draw.ellipse((x - 1, y - 1, x + 1, y + 1), fill=(*accent, alpha))


def draw_node(
    image: Image.Image,
    center: tuple[float, float],
    radius: float,
    accent: tuple[int, int, int],
    phase: float,
) -> None:
    cx, cy = center
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    pulse = 1 + 0.035 * math.sin(phase * math.tau)
    for multiplier, alpha, width in ((1.35, 24, 5), (1.05, 50, 4)):
        points = hex_points(cx, cy, radius * multiplier * pulse)
        glow_draw.line(points + [points[0]], fill=(*accent, alpha), width=width, joint="curve")
    glow = glow.filter(ImageFilter.GaussianBlur(12))
    image.alpha_composite(glow)

    draw = ImageDraw.Draw(image, "RGBA")
    outer = hex_points(cx, cy, radius * 1.28 * pulse)
    inner = hex_points(cx, cy, radius * 0.78 * pulse)
    draw.line(outer + [outer[0]], fill=(*INK, 205), width=8, joint="curve")
    draw.line(inner + [inner[0]], fill=(*accent, 160), width=3, joint="curve")
    draw.polygon(hex_points(cx, cy, radius * 0.46 * pulse), fill=(*RED, 238))


def draw_path(
    image: Image.Image,
    points: list[tuple[float, float]],
    accent: tuple[int, int, int],
    phase: float,
    reverse: bool = False,
) -> None:
    draw = ImageDraw.Draw(image, "RGBA")
    draw.line(points, fill=(*INK, 48), width=2, joint="curve")
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    for index in range(7):
        progress = (phase * (0.7 if reverse else 0.9) + index / 7) % 1
        if reverse:
            progress = 1 - progress
        x, y = line_point(points, progress)
        size = 4 + 3 * math.sin((phase + index / 7) * math.tau) ** 2
        glow_draw.ellipse((x - size * 2, y - size * 2, x + size * 2, y + size * 2), fill=(*accent, 65))
        draw.ellipse((x - size, y - size, x + size, y + size), fill=(*accent, 225))
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(10)))


def draw_horizon(frame: int) -> Image.Image:
    phase = frame / FRAME_COUNT
    image = background(TEAL).convert("RGBA")
    draw_grid(image, TEAL, phase)
    center = (760, 360)
    paths = [
        [(80, 230), (270, 230), (430, 330), (615, 330), center],
        [(65, 360), (280, 360), (440, 360), (610, 360), center],
        [(80, 495), (270, 495), (430, 390), (615, 390), center],
        [center, (910, 360), (1030, 245), (1215, 245)],
        [center, (910, 360), (1030, 475), (1215, 475)],
    ]
    for index, path in enumerate(paths):
        draw_path(image, path, TEAL if index < 3 else SKY, phase + index * 0.08)
    draw_node(image, center, 86, TEAL, phase)
    return image.convert("RGB")


def draw_management(frame: int) -> Image.Image:
    phase = frame / FRAME_COUNT
    image = background(SKY).convert("RGBA")
    draw_grid(image, SKY, phase)
    center = (640, 360)
    top_path = [(55, 285), (220, 285), (355, 330), (500, 330), center]
    bottom_path = [(1225, 435), (1055, 435), (920, 390), (780, 390), center]
    loop = [
        (640 + 220 * math.cos(index * math.tau / 72), 360 + 155 * math.sin(index * math.tau / 72))
        for index in range(73)
    ]
    draw_path(image, top_path, SKY, phase)
    draw_path(image, bottom_path, TEAL, phase, reverse=True)
    draw_path(image, loop, AMBER, phase * 0.65)
    draw_node(image, center, 82, SKY, phase)
    return image.convert("RGB")


def draw_harvesting(frame: int) -> Image.Image:
    phase = frame / FRAME_COUNT
    image = background(AMBER).convert("RGBA")
    draw_grid(image, AMBER, phase)
    center = (840, 360)
    sources = [(120, 150), (95, 360), (120, 570), (330, 245), (330, 475)]
    draw = ImageDraw.Draw(image, "RGBA")
    for index, source in enumerate(sources):
        sx, sy = source
        source_phase = phase + index * 0.11
        radius = 15 + 4 * math.sin(source_phase * math.tau)
        draw.ellipse((sx - radius, sy - radius, sx + radius, sy + radius), fill=(*AMBER, 220))
        elbow = (510 + index * 22, 305 + index * 26)
        draw_path(image, [source, elbow, center], TEAL if index % 2 else AMBER, source_phase)
    draw_path(image, [center, (1030, 360), (1215, 360)], RED, phase)
    draw_node(image, center, 84, AMBER, phase)
    return image.convert("RGB")


def encode(name: str, renderer) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    frame_dir = Path(tempfile.mkdtemp(prefix=f"arf-{name}-"))
    try:
        for frame in range(FRAME_COUNT):
            renderer(frame).save(frame_dir / f"{frame:04d}.png")

        poster_source = frame_dir / f"{FRAME_COUNT // 3:04d}.png"
        Image.open(poster_source).save(
            OUTPUT_DIR / f"{name}-poster.webp",
            "WEBP",
            quality=82,
            method=6,
        )

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-framerate",
                str(FPS),
                "-i",
                str(frame_dir / "%04d.png"),
                "-c:v",
                "libx264",
                "-preset",
                "slow",
                "-crf",
                "30",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                "-an",
                str(OUTPUT_DIR / f"{name}.mp4"),
            ],
            check=True,
        )
    finally:
        shutil.rmtree(frame_dir)


def main() -> None:
    films = (
        ("energy-horizon", draw_horizon),
        ("energy-management", draw_management),
        ("energy-harvesting", draw_harvesting),
    )
    for name, renderer in films:
        if not (OUTPUT_DIR / f"{name}.mp4").exists():
            encode(name, renderer)


if __name__ == "__main__":
    main()
