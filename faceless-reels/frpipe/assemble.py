"""Stage 5 — compose the final 9:16 MP4 with FFmpeg.

Takes the voiceover, optional B-roll clips, and the .srt, and produces a vertical
1080x1920 video: clips are scaled/cropped to fill, concatenated to cover the audio
length, captions burned in, audio muxed.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

W, H = 1080, 1920


def _ffprobe_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(path),
        ]
    )
    return float(out.strip())


def _require_ffmpeg() -> None:
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("ffmpeg/ffprobe not found on PATH. Install FFmpeg first.")


def assemble(
    audio_path: Path,
    clips: list[Path],
    srt_path: Path | None,
    out_path: Path,
    *,
    captions: bool = True,
    bg_color: str = "black",
) -> Path:
    _require_ffmpeg()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    duration = _ffprobe_duration(audio_path)

    # Build the visual base: either looped/concatenated B-roll or a solid colour.
    norm = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1"
    cmd: list[str] = ["ffmpeg", "-y"]

    if clips:
        for clip in clips:
            cmd += ["-stream_loop", "-1", "-i", str(clip)]
        cmd += ["-i", str(audio_path)]
        # Normalize each clip, give each a slice of the timeline, concat to cover audio.
        per = max(duration / len(clips), 1.0)
        filters = []
        for i in range(len(clips)):
            filters.append(f"[{i}:v]{norm},trim=duration={per:.3f},setpts=PTS-STARTPTS[v{i}]")
        concat_inputs = "".join(f"[v{i}]" for i in range(len(clips)))
        filters.append(f"{concat_inputs}concat=n={len(clips)}:v=1:a=0[base]")
        video_label = "[base]"
        audio_idx = len(clips)
    else:
        cmd += [
            "-f", "lavfi", "-i", f"color=c={bg_color}:s={W}x{H}:d={duration:.3f}",
            "-i", str(audio_path),
        ]
        filters = [f"[0:v]setsar=1[base]"]
        video_label = "[base]"
        audio_idx = 1

    if captions and srt_path and srt_path.exists():
        # Escape the path for the subtitles filter.
        srt_escaped = str(srt_path).replace("\\", "/").replace(":", "\\:")
        filters.append(
            f"{video_label}subtitles='{srt_escaped}':"
            "force_style='Alignment=2,MarginV=80,Fontsize=18,Outline=2,Shadow=0'[vout]"
        )
        video_out = "[vout]"
    else:
        filters.append(f"{video_label}null[vout]")
        video_out = "[vout]"

    cmd += [
        "-filter_complex", ";".join(filters),
        "-map", video_out,
        "-map", f"{audio_idx}:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", str(out_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return out_path
