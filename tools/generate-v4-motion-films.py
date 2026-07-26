#!/usr/bin/env python3
"""Render ARF V4's fixed-camera, genuinely animated energy films.

The WebP artwork is used as a stationary environment. Motion comes from
periodic energy ribbons, travelling particles, atmospheric motes and expanding
field pulses. Nothing in the background is panned, cropped or zoomed.

These films are conceptual visualisations. They do not depict products,
prototypes, patents, laboratories, customers or partner projects.
"""

from __future__ import annotations

import argparse
import math
import random
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
MEDIA_DIR = ROOT / "assets" / "media" / "v4"

WIDTH = 1280
HEIGHT = 720
GLOW_SCALE = 2
GLOW_SIZE = (WIDTH // GLOW_SCALE, HEIGHT // GLOW_SCALE)
FPS = 24
SECONDS = 10
FRAME_COUNT = FPS * SECONDS

CYAN = (77, 225, 227)
TURQUOISE = (38, 190, 193)
ICE = (191, 248, 239)
IVORY = (255, 231, 177)
GOLD = (240, 193, 105)
ARF_RED = (227, 24, 35)

Point = tuple[float, float]
Curve = tuple[Point, Point, Point, Point]
Color = tuple[int, int, int]


@dataclass(frozen=True)
class Flow:
    curve: Curve
    color: Color
    phase: float = 0.0
    cycles: int = 1
    particles: int = 5
    width: int = 2
    wave: float = 0.008
    reverse: bool = False


@dataclass(frozen=True)
class Scene:
    key: str
    poster: str
    movie: str
    flows: tuple[Flow, ...]
    nodes: tuple[Point, ...]
    motes: int
    grade: Color


def flow(
    curve: Curve,
    color: Color,
    *,
    phase: float = 0.0,
    cycles: int = 1,
    particles: int = 5,
    width: int = 2,
    wave: float = 0.008,
    reverse: bool = False,
) -> Flow:
    return Flow(curve, color, phase, cycles, particles, width, wave, reverse)


SCENES = {
    "home": Scene(
        key="home",
        poster="utopia-home-energy.webp",
        movie="utopia-home-energy-motion-v2.mp4",
        flows=(
            flow(((-0.08, 0.84), (0.22, 0.77), (0.49, 0.83), (0.70, 0.61)), CYAN, particles=7),
            flow(((-0.05, 0.67), (0.28, 0.65), (0.48, 0.76), (0.70, 0.61)), IVORY, phase=0.23, particles=6),
            flow(((0.19, -0.08), (0.43, 0.17), (0.63, 0.28), (0.70, 0.61)), ICE, phase=0.47),
            flow(((0.70, 0.61), (0.78, 0.52), (0.90, 0.58), (1.08, 0.43)), CYAN, phase=0.31, particles=7),
            flow(((0.70, 0.61), (0.81, 0.70), (0.90, 0.68), (1.08, 0.80)), GOLD, phase=0.64, particles=6),
        ),
        nodes=((0.70, 0.61), (0.86, 0.57)),
        motes=42,
        grade=(14, 49, 55),
    ),
    "corporate": Scene(
        key="corporate",
        poster="utopia-corporate-core.webp",
        movie="utopia-corporate-core-motion-v2.mp4",
        flows=(
            flow(((-0.08, 0.72), (0.25, 0.69), (0.32, 0.54), (0.50, 0.52)), CYAN, particles=7),
            flow(((0.15, 1.06), (0.25, 0.76), (0.38, 0.62), (0.50, 0.52)), ICE, phase=0.28),
            flow(((0.50, 0.52), (0.67, 0.35), (0.82, 0.45), (1.08, 0.20)), IVORY, phase=0.56, particles=7),
            flow(((0.50, 0.52), (0.68, 0.69), (0.84, 0.63), (1.08, 0.79)), TURQUOISE, phase=0.72),
        ),
        nodes=((0.50, 0.52),),
        motes=34,
        grade=(23, 47, 50),
    ),
    "management": Scene(
        key="management",
        poster="utopia-energy-management.webp",
        movie="utopia-energy-management-motion-v2.mp4",
        flows=(
            flow(((-0.08, 0.80), (0.22, 0.83), (0.28, 0.66), (0.48, 0.62)), CYAN, particles=7),
            flow(((-0.08, 0.54), (0.17, 0.53), (0.34, 0.50), (0.48, 0.62)), IVORY, phase=0.18, particles=7),
            flow(((0.12, 1.06), (0.27, 0.78), (0.35, 0.75), (0.48, 0.62)), ICE, phase=0.38),
            flow(((0.48, 0.62), (0.60, 0.43), (0.67, 0.40), (0.77, 0.31)), GOLD, phase=0.54, particles=6),
            flow(((0.48, 0.62), (0.67, 0.72), (0.79, 0.54), (1.08, 0.39)), CYAN, phase=0.73, particles=8),
            flow(((0.77, 0.31), (0.83, 0.19), (0.94, 0.23), (1.08, 0.13)), ICE, phase=0.86),
        ),
        nodes=((0.48, 0.62), (0.77, 0.31), (0.84, 0.48)),
        motes=38,
        grade=(10, 49, 60),
    ),
    "harvesting": Scene(
        key="harvesting",
        poster="utopia-energy-harvesting.webp",
        movie="utopia-energy-harvesting-motion-v2.mp4",
        flows=(
            flow(((0.12, -0.08), (0.28, 0.24), (0.52, 0.27), (0.70, 0.43)), IVORY, particles=7),
            flow(((-0.08, 0.23), (0.25, 0.28), (0.48, 0.35), (0.70, 0.43)), GOLD, phase=0.16, particles=6),
            flow(((-0.08, 0.78), (0.21, 0.76), (0.45, 0.59), (0.70, 0.43)), CYAN, phase=0.35, particles=8),
            flow(((0.23, 1.08), (0.37, 0.75), (0.54, 0.65), (0.70, 0.43)), ICE, phase=0.52, particles=7),
            flow(((0.70, 0.43), (0.82, 0.36), (0.91, 0.45), (1.08, 0.34)), IVORY, phase=0.61, particles=7),
            flow(((0.70, 0.43), (0.79, 0.58), (0.91, 0.57), (1.08, 0.70)), CYAN, phase=0.82, particles=8),
        ),
        nodes=((0.70, 0.43),),
        motes=46,
        grade=(25, 48, 48),
    ),
    "research": Scene(
        key="research",
        poster="utopia-research-ip.webp",
        movie="utopia-research-ip-motion-v2.mp4",
        flows=(
            flow(((-0.08, 0.70), (0.24, 0.72), (0.43, 0.54), (0.63, 0.53)), CYAN, particles=8),
            flow(((0.13, -0.08), (0.35, 0.20), (0.49, 0.28), (0.63, 0.53)), ICE, phase=0.23, particles=6),
            flow(((0.63, 0.53), (0.71, 0.35), (0.79, 0.35), (0.85, 0.43)), IVORY, phase=0.42, particles=6),
            flow(((0.63, 0.53), (0.75, 0.67), (0.83, 0.62), (1.08, 0.77)), TURQUOISE, phase=0.58, particles=8),
            flow(((0.85, 0.43), (0.92, 0.31), (0.99, 0.34), (1.08, 0.25)), CYAN, phase=0.77, particles=6),
        ),
        nodes=((0.63, 0.53), (0.85, 0.43), (0.73, 0.67)),
        motes=45,
        grade=(12, 46, 56),
    ),
    "publications": Scene(
        key="publications",
        poster="utopia-publications-atlas.webp",
        movie="utopia-publications-atlas-motion-v2.mp4",
        flows=(
            flow(((-0.08, 0.75), (0.20, 0.70), (0.43, 0.82), (0.60, 0.65)), IVORY, particles=7),
            flow(((-0.08, 0.90), (0.26, 0.86), (0.45, 0.90), (0.67, 0.69)), CYAN, phase=0.20, particles=8),
            flow(((0.12, 1.08), (0.31, 0.78), (0.46, 0.76), (0.60, 0.65)), GOLD, phase=0.39, particles=6),
            flow(((0.60, 0.65), (0.72, 0.56), (0.82, 0.52), (1.08, 0.37)), ICE, phase=0.57, particles=8),
            flow(((0.67, 0.69), (0.79, 0.78), (0.91, 0.65), (1.08, 0.74)), TURQUOISE, phase=0.78, particles=7),
        ),
        nodes=((0.60, 0.65), (0.67, 0.69)),
        motes=36,
        grade=(16, 46, 53),
    ),
}


def cubic(curve: Curve, amount: float) -> Point:
    inverse = 1.0 - amount
    x = (
        inverse**3 * curve[0][0]
        + 3 * inverse**2 * amount * curve[1][0]
        + 3 * inverse * amount**2 * curve[2][0]
        + amount**3 * curve[3][0]
    )
    y = (
        inverse**3 * curve[0][1]
        + 3 * inverse**2 * amount * curve[1][1]
        + 3 * inverse * amount**2 * curve[2][1]
        + amount**3 * curve[3][1]
    )
    return x, y


def path_points(flow_spec: Flow, time: float, count: int = 150) -> list[Point]:
    points: list[Point] = []
    for index in range(count):
        amount = index / (count - 1)
        x, y = cubic(flow_spec.curve, amount)
        envelope = math.sin(math.pi * amount)
        wave = math.tau * (amount * 2.0 - time + flow_spec.phase)
        x += math.sin(wave) * flow_spec.wave * 0.35 * envelope
        y += math.cos(wave) * flow_spec.wave * envelope
        points.append((x * WIDTH, y * HEIGHT))
    if flow_spec.reverse:
        points.reverse()
    return points


def point_on_path(points: list[Point], amount: float) -> Point:
    amount = min(1.0, max(0.0, amount))
    position = amount * (len(points) - 1)
    index = min(len(points) - 2, int(position))
    fraction = position - index
    x1, y1 = points[index]
    x2, y2 = points[index + 1]
    return x1 + (x2 - x1) * fraction, y1 + (y2 - y1) * fraction


def scale_points(points: Iterable[Point], scale: int) -> list[Point]:
    return [(x / scale, y / scale) for x, y in points]


def static_background(scene: Scene) -> Image.Image:
    source = Image.open(MEDIA_DIR / scene.poster).convert("RGB")
    source = source.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    source = ImageEnhance.Contrast(source).enhance(1.05)
    source = ImageEnhance.Color(source).enhance(0.94)

    grade = Image.new("RGBA", source.size, (*scene.grade, 14))
    graded = Image.alpha_composite(source.convert("RGBA"), grade)

    vignette = Image.new("L", source.size, 0)
    draw = ImageDraw.Draw(vignette)
    draw.ellipse(
        (-WIDTH * 0.18, -HEIGHT * 0.46, WIDTH * 1.18, HEIGHT * 1.46),
        fill=30,
    )
    vignette = ImageEnhance.Contrast(vignette.filter(ImageFilter.GaussianBlur(90))).enhance(1.2)
    shade = Image.new("RGBA", source.size, (0, 8, 14, 0))
    shade.putalpha(Image.eval(vignette, lambda value: 34 - min(30, value)))
    return Image.alpha_composite(graded, shade)


def seeded_motes(scene: Scene) -> list[tuple[float, float, float, float, Color]]:
    randomizer = random.Random(f"arf-{scene.key}-motion-v2")
    palette = (CYAN, ICE, IVORY, GOLD)
    motes = []
    for _ in range(scene.motes):
        motes.append(
            (
                randomizer.random(),
                randomizer.random(),
                randomizer.random(),
                randomizer.uniform(0.5, 1.0),
                randomizer.choice(palette),
            )
        )
    return motes


def draw_flow(
    glow_draw: ImageDraw.ImageDraw,
    sharp_draw: ImageDraw.ImageDraw,
    flow_spec: Flow,
    time: float,
) -> None:
    points = path_points(flow_spec, time)
    half_points = scale_points(points, GLOW_SCALE)
    pulse = 0.78 + 0.22 * math.sin(math.tau * (time + flow_spec.phase))

    glow_draw.line(
        half_points,
        fill=(*flow_spec.color, round(34 * pulse)),
        width=max(2, flow_spec.width * 3),
        joint="curve",
    )
    sharp_draw.line(
        points,
        fill=(*flow_spec.color, round(54 * pulse)),
        width=flow_spec.width,
        joint="curve",
    )

    for particle_index in range(flow_spec.particles):
        offset = particle_index / flow_spec.particles + flow_spec.phase
        amount = (time * flow_spec.cycles + offset) % 1.0
        visibility = min(1.0, amount / 0.08, (1.0 - amount) / 0.08)
        if visibility <= 0:
            continue

        tail_length = 0.048
        tail_points: list[Point] = []
        for tail_index in range(9):
            tail_amount = amount - tail_length + tail_length * tail_index / 8
            if tail_amount >= 0:
                tail_points.append(point_on_path(points, tail_amount))

        if len(tail_points) > 1:
            sharp_draw.line(
                tail_points,
                fill=(*flow_spec.color, round(115 * visibility)),
                width=flow_spec.width + 1,
                joint="curve",
            )
            glow_draw.line(
                scale_points(tail_points, GLOW_SCALE),
                fill=(*flow_spec.color, round(130 * visibility)),
                width=max(3, flow_spec.width * 3),
                joint="curve",
            )

        x, y = point_on_path(points, amount)
        radius = 1.45 + 0.45 * math.sin(math.tau * (time * 2 + offset)) ** 2
        sharp_draw.ellipse(
            (x - radius, y - radius, x + radius, y + radius),
            fill=(*flow_spec.color, round(235 * visibility)),
        )
        hx, hy = x / GLOW_SCALE, y / GLOW_SCALE
        glow_radius = 7.0 / GLOW_SCALE
        glow_draw.ellipse(
            (hx - glow_radius, hy - glow_radius, hx + glow_radius, hy + glow_radius),
            fill=(*flow_spec.color, round(165 * visibility)),
        )


def draw_nodes(
    glow_draw: ImageDraw.ImageDraw,
    sharp_draw: ImageDraw.ImageDraw,
    scene: Scene,
    time: float,
) -> None:
    for node_index, (nx, ny) in enumerate(scene.nodes):
        x, y = nx * WIDTH, ny * HEIGHT
        phase = (time * 2 + node_index * 0.37) % 1.0
        radius = 10 + 48 * phase
        alpha = round(92 * (1.0 - phase) ** 1.7)
        sharp_draw.ellipse(
            (x - radius, y - radius, x + radius, y + radius),
            outline=(*ICE, alpha),
            width=1,
        )

        pulse = 0.5 + 0.5 * math.sin(math.tau * (time + node_index * 0.29))
        glow_radius = (19 + 9 * pulse) / GLOW_SCALE
        hx, hy = x / GLOW_SCALE, y / GLOW_SCALE
        glow_draw.ellipse(
            (hx - glow_radius, hy - glow_radius, hx + glow_radius, hy + glow_radius),
            fill=(*ICE, round(68 + 34 * pulse)),
        )

        dot_radius = 1.4 + pulse
        sharp_draw.ellipse(
            (x - dot_radius, y - dot_radius, x + dot_radius, y + dot_radius),
            fill=(*ARF_RED, 228),
        )


def draw_motes(
    glow_draw: ImageDraw.ImageDraw,
    sharp_draw: ImageDraw.ImageDraw,
    motes: list[tuple[float, float, float, float, Color]],
    time: float,
) -> None:
    for x_base, y_base, offset, magnitude, color in motes:
        wave = math.tau * (time + offset)
        x = (x_base + 0.012 * math.sin(wave) * magnitude) * WIDTH
        y = (y_base - 0.020 * math.sin(wave) * magnitude) * HEIGHT
        opacity = max(0.0, math.sin(math.tau * (time * 2 + offset)))
        opacity = opacity * opacity * 0.55
        if opacity < 0.03:
            continue
        radius = 0.55 + magnitude * 0.65
        sharp_draw.ellipse(
            (x - radius, y - radius, x + radius, y + radius),
            fill=(*color, round(150 * opacity)),
        )
        if opacity > 0.25:
            hx, hy = x / GLOW_SCALE, y / GLOW_SCALE
            glow_draw.ellipse(
                (hx - 1.8, hy - 1.8, hx + 1.8, hy + 1.8),
                fill=(*color, round(75 * opacity)),
            )


def render_frame(
    scene: Scene,
    background: Image.Image,
    motes: list[tuple[float, float, float, float, Color]],
    frame_number: int,
) -> Image.Image:
    time = frame_number / FRAME_COUNT
    glow = Image.new("RGBA", GLOW_SIZE, (0, 0, 0, 0))
    sharp = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow, "RGBA")
    sharp_draw = ImageDraw.Draw(sharp, "RGBA")

    for flow_spec in scene.flows:
        draw_flow(glow_draw, sharp_draw, flow_spec, time)
    draw_nodes(glow_draw, sharp_draw, scene, time)
    draw_motes(glow_draw, sharp_draw, motes, time)

    glow = glow.filter(ImageFilter.GaussianBlur(5.5))
    glow = glow.resize((WIDTH, HEIGHT), Image.Resampling.BICUBIC)

    frame = Image.alpha_composite(background.copy(), glow)
    frame = Image.alpha_composite(frame, sharp)
    return frame.convert("RGB")


def encode(scene: Scene) -> None:
    movie_path = MEDIA_DIR / scene.movie
    temporary_path = movie_path.with_suffix(".rendering.mp4")
    background = static_background(scene)
    motes = seeded_motes(scene)

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
        "medium",
        "-crf",
        "24",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(temporary_path),
    ]

    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    try:
        for frame_number in range(FRAME_COUNT):
            frame = render_frame(scene, background, motes, frame_number)
            process.stdin.write(frame.tobytes())
            if frame_number and frame_number % FPS == 0:
                elapsed = frame_number // FPS
                print(f"  {scene.key}: {elapsed}/{SECONDS} sn", flush=True)
    finally:
        process.stdin.close()

    if process.wait() != 0:
        temporary_path.unlink(missing_ok=True)
        raise RuntimeError(f"FFmpeg failed while encoding {scene.key}")
    temporary_path.replace(movie_path)
    print(f"  created {movie_path.relative_to(ROOT)}", flush=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--scene",
        choices=("all", *SCENES.keys()),
        default="all",
        help="Render one scene or every V4 scene.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    selected = SCENES.values() if args.scene == "all" else (SCENES[args.scene],)
    for scene in selected:
        print(f"Rendering {scene.key} with a fixed camera...", flush=True)
        encode(scene)


if __name__ == "__main__":
    main()
