"""Stage 3 — fetch background visuals.

Two providers ship here:
  * pexels — free vertical stock video clips matched to the script's search terms.
  * color  — a solid-colour background (no key, good for audiogram-style music posts).

For *generative* video with native audio/dialogue (Veo 3, Sora 2, Kling, ...) you don't
use this narration-over-broll path at all — see README "generative" notes. Those produce
a finished clip with sound, so they replace stages 2-4 rather than feeding this one.
"""
from __future__ import annotations

from pathlib import Path

import httpx

_PEXELS_SEARCH = "https://api.pexels.com/videos/search"


def fetch_clips(
    search_terms: list[str],
    out_dir: Path,
    *,
    source: str = "pexels",
    api_key: str = "",
    orientation: str = "portrait",
    max_clips: int = 4,
) -> list[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    if source == "color":
        return []  # assemble.py will fall back to a solid background
    if source != "pexels":
        raise ValueError(f"Unknown visuals source: {source}")
    if not api_key:
        raise RuntimeError("PEXELS_API_KEY is required for the pexels visuals source.")

    paths: list[Path] = []
    headers = {"Authorization": api_key}
    with httpx.Client(timeout=30, headers=headers) as client:
        for i, term in enumerate(search_terms[:max_clips]):
            resp = client.get(
                _PEXELS_SEARCH,
                params={"query": term, "orientation": orientation, "per_page": 1},
            )
            resp.raise_for_status()
            videos = resp.json().get("videos", [])
            if not videos:
                continue
            # Pick the highest-resolution portrait-ish file available.
            files = sorted(
                videos[0]["video_files"],
                key=lambda f: (f.get("height") or 0),
                reverse=True,
            )
            if not files:
                continue
            clip_path = out_dir / f"clip_{i:02d}.mp4"
            with client.stream("GET", files[0]["link"]) as dl:
                dl.raise_for_status()
                with clip_path.open("wb") as fh:
                    for chunk in dl.iter_bytes():
                        fh.write(chunk)
            paths.append(clip_path)
    return paths
