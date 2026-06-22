"""Stage 6 — publish the finished video to Instagram / YouTube / TikTok.

Default provider is Upload-Post (https://www.upload-post.com/): one API that fans out
to all three platforms, so you skip running three separate OAuth + app-review flows.

If you'd rather drop the dependency, the native platform clients are sketched at the
bottom — each needs its own app, OAuth, and (for IG/TikTok) an approval period. See the
README "auto-posting" section for the gating details.
"""
from __future__ import annotations

from pathlib import Path

import httpx

_UPLOAD_POST_URL = "https://api.upload-post.com/api/upload"


def publish(video_path: Path, caption: str, cfg: dict) -> dict:
    provider = cfg.get("provider", "none")
    if provider == "none":
        return {"skipped": True, "reason": "publish.provider is 'none'"}
    if provider == "upload_post":
        return _publish_upload_post(video_path, caption, cfg)
    raise ValueError(f"Unknown publish provider: {provider}")


def _publish_upload_post(video_path: Path, caption: str, cfg: dict) -> dict:
    api_key = cfg.get("upload_post_api_key", "")
    if not api_key:
        raise RuntimeError("UPLOAD_POST_API_KEY is required to publish.")

    data = {
        "user": cfg.get("upload_post_user", ""),
        "platform[]": cfg.get("platforms", ["instagram", "youtube", "tiktok"]),
        "title": caption,
    }
    with httpx.Client(timeout=300) as client:
        with video_path.open("rb") as fh:
            resp = client.post(
                _UPLOAD_POST_URL,
                headers={"Authorization": f"Apikey {api_key}"},
                data=data,
                files={"video": (video_path.name, fh, "video/mp4")},
            )
    resp.raise_for_status()
    return resp.json()


# --- Native clients (no third-party dependency) ----------------------------------
# Reference outlines. Each requires its own app + OAuth; IG and TikTok also require an
# approval period before posts are public. Fill in tokens from your own OAuth flow.
#
# YouTube Shorts (easiest — no app-review wait):
#   from googleapiclient.discovery import build
#   yt = build("youtube", "v3", credentials=oauth_creds)
#   yt.videos().insert(part="snippet,status",
#       body={"snippet": {"title": caption, "description": caption},
#             "status": {"privacyStatus": "public"}},
#       media_body=MediaFileUpload(str(video_path))).execute()
#
# Instagram Reels (Graph API — needs Business acct + FB Page + content_publish review):
#   1. POST /{ig-user-id}/media   media_type=REELS, video_url=<public url>, caption=...
#   2. poll  /{container-id}?fields=status_code  until FINISHED
#   3. POST /{ig-user-id}/media_publish  creation_id=<container-id>
#   (the video must be reachable at a public URL — host it first)
#
# TikTok (Content Posting API — needs app audit; tokens expire every 24h):
#   POST https://open.tiktokapis.com/v2/post/publish/video/init/
#   then upload the file to the returned upload_url, then poll publish status.
