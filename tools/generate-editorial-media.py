#!/usr/bin/env python3
"""Generate ARF's abstract editorial motion system.

The films are conceptual visualizations, not recordings of products, patents,
laboratory work, or customer projects. They intentionally stay non-literal.
"""

from __future__ import annotations

import math
import subprocess
from functools import lru_cache
from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "media" / "v2"
HERO_SOURCE = OUTPUT_DIR / "hero-energy-flow.webp"

WIDTH = 1440
HEIGHT = 810
FPS = 24
SECONDS = 10
FRAME_COUNT = FPS * SECONDS

PAPER = (246, 243, 236)
PAPER_COOL = (239, 247, 244)
INK = (17, 19, 21)
RED = (227, 38, 46)
TEAL = (22, 167, 163)
AQUA = (91, 205, 199)
STONE = (194, 189, 178)
AMBER = (214, 172, 101)


def mix(a: tuple[int, int, int], b: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(round(a[i] * (1 - amount) + b[i] * amount) for i in range(3))


@lru_cache(maxsize=4)
def paper_background(accent: tuple[int, int, int]) -> Image.Image:
    image = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    draw = ImageDraw.Draw(image)
    for y in range(HEIGHT):
        vertical = y / max(1, HEIGHT - 1)
        tone = mix(PAPER, PAPER_COOL, 0.16 + 0.18 * vertical)
        draw.line((0, y, WIDTH, y), fill=tone)

    haze = Image.new("RGBA", image.size, (0, 0, 0, 0))
    haze_draw = ImageDraw.Draw(haze, "RGBA")
    haze_draw.ellipse(
        (WIDTH * 0.34, -HEIGHT * 0.22, WIDTH * 1.18, HEIGHT * 1.22),
        fill=(*accent, 25),
    )
    haze = haze.filter(ImageFilter.GaussianBlur(115))
    return Image.alpha_composite(image.convert("RGBA"), haze).convert("RGB")


def cubic(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    p3: tuple[float, float],
    amount: float,
) -> tuple[float, float]:
    inverse = 1 - amount
    x = (
        inverse**3 * p0[0]
        + 3 * inverse**2 * amount * p1[0]
        + 3 * inverse * amount**2 * p2[0]
        + amount**3 * p3[0]
    )
    y = (
        inverse**3 * p0[1]
        + 3 * inverse**2 * amount * p1[1]
        + 3 * inverse * amount**2 * p2[1]
        + amount**3 * p3[1]
    )
    return x, y


def curve_points(
    p0: tuple[float, float],
    p1: tuple[float, float],
    p2: tuple[float, float],
    p3: tuple[float, float],
    count: int = 120,
) -> list[tuple[float, float]]:
    return [cubic(p0, p1, p2, p3, index / (count - 1)) for index in range(count)]


def point_on_path(points: list[tuple[float, float]], amount: float) -> tuple[float, float]:
    amount %= 1
    position = amount * (len(points) - 1)
    index = min(len(points) - 2, int(position))
    fraction = position - index
    x1, y1 = points[index]
    x2, y2 = points[index + 1]
    return x1 + (x2 - x1) * fraction, y1 + (y2 - y1) * fraction


def draw_particles(
    image: Image.Image,
    paths: list[list[tuple[float, float]]],
    phase: float,
    color: tuple[int, int, int],
    *,
    per_path: int = 4,
    speed: float = 1.0,
) -> None:
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    sharp = ImageDraw.Draw(image, "RGBA")

    for path_index, path in enumerate(paths):
        for particle_index in range(per_path):
            offset = particle_index / per_path + path_index * 0.071
            amount = (phase * speed + offset) % 1
            x, y = point_on_path(path, amount)
            pulse = 0.65 + 0.35 * math.sin((amount + phase) * math.tau) ** 2
            radius = 1.5 + 2.2 * pulse
            glow_draw.ellipse(
                (x - radius * 5, y - radius * 5, x + radius * 5, y + radius * 5),
                fill=(*color, 46),
            )
            sharp.ellipse(
                (x - radius, y - radius, x + radius, y + radius),
                fill=(*color, 180),
            )

    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(11)))


@lru_cache(maxsize=1)
def hero_base() -> Image.Image:
    if not HERO_SOURCE.exists():
        raise FileNotFoundError(f"Missing hero source: {HERO_SOURCE}")
    return Image.open(HERO_SOURCE).convert("RGB").resize((1520, 855), Image.Resampling.LANCZOS)


def draw_hero(frame_number: int) -> Image.Image:
    phase = frame_number / FRAME_COUNT
    wave = phase * math.tau
    source = hero_base()
    x = round(40 + 22 * math.sin(wave))
    y = round(22 + 11 * math.cos(wave))
    image = source.crop((x, y, x + WIDTH, y + HEIGHT)).convert("RGBA")

    paths: list[list[tuple[float, float]]] = []
    for index in range(9):
        offset = (index - 4) * 42
        paths.append(
            curve_points(
                (600, 405 + offset * 0.18),
                (790, 330 + offset),
                (1100, 330 - offset * 0.42),
                (1510, 250 + offset * 1.15),
            )
        )

    draw_particles(image, paths, phase, AQUA, per_path=3, speed=0.34)

    pulse_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    pulse_draw = ImageDraw.Draw(pulse_layer, "RGBA")
    pulse = 0.5 + 0.5 * math.sin(wave)
    radius = 54 + 9 * pulse
    pulse_draw.ellipse(
        (596 - radius, 405 - radius, 596 + radius, 405 + radius),
        fill=(*AQUA, round(16 + 9 * pulse)),
    )
    image.alpha_composite(pulse_layer.filter(ImageFilter.GaussianBlur(35)))
    return image.convert("RGB")


def draw_management(frame_number: int) -> Image.Image:
    phase = frame_number / FRAME_COUNT
    wave = phase * math.tau
    image = paper_background(TEAL).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")

    for x in range(90, WIDTH, 126):
        draw.line((x, 80, x, HEIGHT - 80), fill=(*INK, 9), width=1)
    for y in range(92, HEIGHT, 104):
        draw.line((70, y, WIDTH - 70, y), fill=(*INK, 7), width=1)

    loop_paths: list[list[tuple[float, float]]] = []
    for index in range(15):
        points = []
        horizontal = 315 + index * 8
        vertical = 168 + index * 4.2
        for sample in range(181):
            theta = sample / 180 * math.tau
            x = 760 + horizontal * math.cos(theta)
            y = 405 + vertical * math.sin(theta) + 15 * math.sin(theta * 2 + index * 0.17)
            points.append((x, y))
        loop_paths.append(points)
        alpha = 19 + index * 2
        draw.line(points, fill=(*TEAL, alpha), width=1 if index < 10 else 2, joint="curve")

    feed_paths: list[list[tuple[float, float]]] = []
    for index in range(8):
        offset = (index - 3.5) * 30
        path = curve_points(
            (-80, 405 + offset),
            (270, 390 + offset * 0.45),
            (415, 405 + offset * 0.18),
            (505, 405 + offset * 0.08),
        )
        feed_paths.append(path)
        draw.line(path, fill=(*AQUA, 34), width=2)

    draw_particles(image, loop_paths[::2], phase, TEAL, per_path=2, speed=0.18)
    draw_particles(image, feed_paths, phase, AQUA, per_path=2, speed=0.26)

    pulse = 0.5 + 0.5 * math.sin(wave)
    draw.arc(
        (435, 205, 1085, 605),
        start=200 + round(8 * pulse),
        end=318 + round(8 * pulse),
        fill=(*RED, 140),
        width=3,
    )
    draw.line((70, 92, 134, 92), fill=(*RED, 210), width=3)
    return image.convert("RGB")


def draw_harvesting(frame_number: int) -> Image.Image:
    phase = frame_number / FRAME_COUNT
    wave = phase * math.tau
    image = paper_background(AMBER).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")

    core = (940, 405)
    source_points = [(120, 118), (92, 255), (145, 405), (92, 555), (120, 692)]
    source_paths: list[list[tuple[float, float]]] = []

    for index, source in enumerate(source_points):
        offset = (index - 2) * 24
        path = curve_points(
            source,
            (400, source[1] + offset),
            (720, 405 + offset * 0.18),
            core,
        )
        source_paths.append(path)
        draw.line(path, fill=(*(TEAL if index % 2 else AMBER), 58), width=2)

        pulse = 0.5 + 0.5 * math.sin(wave + index * 0.9)
        radius = 5 + 5 * pulse
        draw.ellipse(
            (source[0] - radius, source[1] - radius, source[0] + radius, source[1] + radius),
            outline=(*(TEAL if index % 2 else AMBER), 150),
            width=2,
        )

    output_paths: list[list[tuple[float, float]]] = []
    for index in range(7):
        offset = (index - 3) * 31
        path = curve_points(
            core,
            (1080, 405 + offset * 0.18),
            (1240, 350 + offset),
            (1510, 330 + offset * 1.25),
        )
        output_paths.append(path)
        draw.line(path, fill=(*AQUA, 34 + index * 3), width=2)

    draw_particles(image, source_paths, phase, TEAL, per_path=4, speed=0.23)
    draw_particles(image, output_paths, phase, AQUA, per_path=3, speed=0.19)

    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    pulse = 0.5 + 0.5 * math.sin(wave)
    radius = 42 + 8 * pulse
    glow_draw.ellipse(
        (core[0] - radius, core[1] - radius, core[0] + radius, core[1] + radius),
        fill=(*AQUA, 42),
    )
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(28)))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((core[0] - 4, core[1] - 4, core[0] + 4, core[1] + 4), fill=(*RED, 220))
    draw.line((WIDTH - 170, HEIGHT - 82, WIDTH - 90, HEIGHT - 82), fill=(*RED, 210), width=3)
    return image.convert("RGB")


def encode(name: str, renderer: Callable[[int], Image.Image]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    movie_path = OUTPUT_DIR / f"{name}.mp4"
    poster_path = OUTPUT_DIR / f"{name}-poster.webp"

    command = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "rawvideo",
        "-pixel_format",
        "rgb24",
        "-video_size",
        f"{WIDTH}x{HEIGHT}",
        "-framerate",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "25",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(movie_path),
    ]

    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    poster_frame = FPS * 2

    try:
        for frame_number in range(FRAME_COUNT):
            frame = renderer(frame_number)
            if frame_number == poster_frame:
                frame.save(poster_path, "WEBP", quality=82, method=6)
            process.stdin.write(frame.tobytes())
    finally:
        process.stdin.close()

    if process.wait() != 0:
        raise RuntimeError(f"ffmpeg failed while encoding {name}")


def main() -> None:
    films = (
        ("energy-field", draw_hero),
        ("energy-management", draw_management),
        ("energy-harvesting", draw_harvesting),
    )
    for name, renderer in films:
        print(f"Generating {name}...")
        encode(name, renderer)


if __name__ == "__main__":
    main()
