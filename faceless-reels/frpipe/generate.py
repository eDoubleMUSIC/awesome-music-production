"""Orchestrate one full topic -> video (-> publish) run."""
from __future__ import annotations

import re
from pathlib import Path

from . import assemble, captions, publish, script_gen, visuals, voiceover


def _slugify(text: str, maxlen: int = 40) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:maxlen] or "video"


def make_video(topic: str, cfg: dict, out_root: Path, do_publish: bool = False) -> dict:
    slug = _slugify(topic)
    work = out_root / slug
    work.mkdir(parents=True, exist_ok=True)

    # 1. Script
    s = cfg["script"]
    script = script_gen.generate_script(
        topic, cfg["niche"], model=s["model"], api_key=s.get("api_key", "")
    )
    (work / "script.txt").write_text(
        f"{script['hook']}\n\n{script['narration']}", encoding="utf-8"
    )

    # 2. Voiceover
    v = cfg["voiceover"]
    audio = voiceover.synthesize(
        script["narration"], work / "voice.mp3", voice=v["voice"], rate=v.get("rate", "+0%")
    )

    # 3. Visuals
    vis = cfg["visuals"]
    clips = visuals.fetch_clips(
        script["search_terms"], work / "clips",
        source=vis.get("source", "pexels"),
        api_key=vis.get("pexels_api_key", ""),
        orientation=vis.get("orientation", "portrait"),
    )

    # 4. Captions
    c = cfg["captions"]
    srt = None
    if c.get("enabled", True):
        srt = captions.transcribe_to_srt(
            audio, work / "captions.srt", model_size=c.get("whisper_model", "base")
        )

    # 5. Assemble
    final = assemble.assemble(
        audio, clips, srt, work / f"{slug}.mp4",
        captions=c.get("enabled", True),
    )

    result = {"topic": topic, "slug": slug, "video": str(final), "hook": script["hook"]}

    # 6. Publish
    if do_publish:
        p = cfg["publish"]
        caption = p.get("caption_template", "{hook}").format(hook=script["hook"])
        result["publish"] = publish.publish(final, caption, p)

    return result
