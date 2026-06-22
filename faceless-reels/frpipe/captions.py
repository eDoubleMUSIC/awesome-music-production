"""Stage 4 — transcribe the voiceover to a timed .srt with faster-whisper."""
from __future__ import annotations

from pathlib import Path


def _fmt_ts(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def transcribe_to_srt(audio_path: Path, out_path: Path, model_size: str = "base") -> Path:
    """Run Whisper over audio_path and write word-aligned captions to out_path (.srt)."""
    from faster_whisper import WhisperModel

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(str(audio_path), word_timestamps=True)

    lines: list[str] = []
    idx = 1
    for segment in segments:
        # Group words into short caption chunks (~5 words) for readable subtitles.
        words = segment.words or []
        if not words:
            lines.append(
                f"{idx}\n{_fmt_ts(segment.start)} --> {_fmt_ts(segment.end)}\n"
                f"{segment.text.strip()}\n"
            )
            idx += 1
            continue
        for i in range(0, len(words), 5):
            chunk = words[i : i + 5]
            text = "".join(w.word for w in chunk).strip()
            lines.append(
                f"{idx}\n{_fmt_ts(chunk[0].start)} --> {_fmt_ts(chunk[-1].end)}\n{text}\n"
            )
            idx += 1

    out_path.write_text("\n".join(lines), encoding="utf-8")
    return out_path
