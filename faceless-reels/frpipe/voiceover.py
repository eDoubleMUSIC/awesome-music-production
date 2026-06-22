"""Stage 2 — synthesize a voiceover with edge-tts (free, no API key)."""
from __future__ import annotations

import asyncio
from pathlib import Path

import edge_tts


def synthesize(text: str, out_path: Path, voice: str, rate: str = "+0%") -> Path:
    """Write an mp3 voiceover for `text` to out_path. Returns the path."""
    out_path.parent.mkdir(parents=True, exist_ok=True)

    async def _run() -> None:
        communicate = edge_tts.Communicate(text, voice, rate=rate)
        await communicate.save(str(out_path))

    asyncio.run(_run())
    return out_path
