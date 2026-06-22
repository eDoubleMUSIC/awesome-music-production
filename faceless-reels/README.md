# Faceless Reels — self-hosted generate-and-post pipeline

A small, self-hostable clone of "faceless reels" SaaS tools (like facelessreels.com).
It turns a topic into a captioned 9:16 video and publishes it to **Instagram Reels,
YouTube Shorts, and TikTok** — the same generate-and-auto-post loop those tools sell
for $19–69/month, built from commodity APIs you control.

> Built for the [Leo Mask](https://www.leomask.com/) faceless-artist workflow, but the
> niche/voice/visuals are all config — point it at anything.

## Why this exists (the short version)

Every "AI makes faceless reels and posts them for you" product is the same six-stage
pipeline over commodity APIs. There is no proprietary core. What the SaaS actually
charges for is the glue code and a posting scheduler — both small. This is that glue,
open and self-hosted, for a few dollars a month in API calls instead of a subscription.

| Stage | This repo uses | Free? | Paid upgrade |
|-------|----------------|-------|--------------|
| 1. Script | Claude API (`claude-opus-4-8`) | ~cents/video | — |
| 2. Voiceover | [`edge-tts`](https://github.com/rany2/edge-tts) | ✅ free, no key | ElevenLabs |
| 3. Visuals | [Pexels](https://www.pexels.com/api/) stock video | ✅ free key | AI video (Sora / fal.ai / Seedance) |
| 4. Captions | [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper) | ✅ free, local | — |
| 5. Render | FFmpeg | ✅ free | Shotstack / Creatomate |
| 6. Auto-post | [Upload-Post](https://www.upload-post.com/) (unified) **or** native platform APIs | 10 posts/mo free | Buffer / Metricool |

## The one genuinely hard part: auto-posting

The AI stages are easy. Publishing on your behalf is the part the SaaS is really
selling, because each platform gates programmatic posting:

- **YouTube Shorts** — YouTube Data API v3, OAuth, posts immediately. Easiest, no review wait.
- **Instagram Reels** — needs an IG **Business** account + linked Facebook Page + a Meta
  app with `instagram_business_content_publish` (**2–4 week app review**). Hard cap ~25
  API posts / 24h.
- **TikTok** — Content Posting API, OAuth, **2–6 week audit** (until approved, posts are
  private-only). Access tokens expire every 24h, so you need a refresh loop. ~15/day.

Because doing all three OAuth/app-review flows yourself is weeks of work, the **default
publisher in this repo is [Upload-Post](https://www.upload-post.com/)** — one API that
fans out to all three platforms (it owns the platform approvals; you connect your
accounts in their dashboard, 10 free uploads/month). Native per-platform clients are
stubbed in `frpipe/publish.py` for when you want to drop the dependency.

## Pipeline

```
topic ──▶ script_gen ──▶ voiceover ──▶ visuals ──▶ captions ──▶ assemble ──▶ out/<slug>.mp4
 (Claude)        (edge-tts)     (Pexels)    (whisper)    (ffmpeg)              │
                                                                              ▼
                                                                          publish ──▶ IG / YT / TikTok
```

## Setup

Requires **Python 3.11+** and **FFmpeg** on your PATH (`ffmpeg -version` to check).

```bash
cd faceless-reels
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp config.example.yaml config.yaml   # then fill in keys
```

Keys you need (put them in your environment or `config.yaml`):

| Variable | Used for | Get it from |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | script generation | https://platform.claude.com |
| `PEXELS_API_KEY` | stock B-roll | https://www.pexels.com/api/ |
| `UPLOAD_POST_API_KEY` | publishing (default path) | https://www.upload-post.com/ |

`edge-tts` and `faster-whisper` need no keys.

## Usage

```bash
# Generate one video from a topic, don't post (default — review before publishing)
python run.py --topic "the myth of Icarus, in a dramatic narrated style"

# Generate AND publish to every platform in config.yaml
python run.py --topic "3 underrated synthwave production tricks" --publish

# Drive a whole content calendar from a CSV/sheet of topics
python run.py --topics-file topics.txt --publish
```

Output lands in `out/<slug>/` (the final `.mp4`, plus the script, audio, and `.srt`
so you can inspect or re-edit any stage).

## Two ways to make the visuals: stock vs. generative

This repo ships the **narration-over-B-roll** path (cheapest, what most faceless SaaS
actually does): Claude writes the script, TTS narrates it, and stock clips play
underneath. That's stages 2–5 above.

If you instead want **AI-generated video with native audio/dialogue** (a synthetic
narrator that speaks, sound effects, full scenes), that's a *different* branch — a
generative video model produces a finished clip *with sound*, so it replaces stages 2–4
rather than feeding stage 3. Here's the current landscape (June 2026):

| Model | Native audio/dialogue? | ~Cost (with audio) | Notes |
|-------|------------------------|--------------------|-------|
| **Veo 3.1 Lite / fast** | ✅ yes | **~$0.05–0.15/sec** | Best value; Google-grade. ~$1.50–4.50 per 30s clip |
| Kling 3.0 | ✅ yes | ~$0.10/sec | Strong multi-shot consistency |
| Seedance 1.5 Pro / Wan 2.6 | ✅ yes | ~$0.05/sec | Wan is open-source |
| Veo 3.1 (full) | ✅ yes | ~$0.40/sec | Highest quality, pricier |
| Sora 2 | ✅ yes | ~$0.75/sec | Most expensive per second |

### About "Nano Banana"

Nano Banana = Google's **Gemini 2.5 Flash Image** (and the newer Nano Banana 2 /
Pro). It's an **image** model (~$0.04–0.13 per image), **not** a video generator — it
can't make a moving clip or audio on its own. Where it *is* worth it: generating or
editing **still frames / thumbnails / consistent characters**, which you then animate
with a video model (image-to-video). The standard combo is **Nano Banana for the keyframe
→ Veo 3 for the motion+audio** — they're designed to pair, and Google ships a
[quickstart for exactly that](https://github.com/google-gemini/veo-3-nano-banana-gemini-api-quickstart).

**Recommendation:** For a steady faceless channel, the **stock + free-TTS path in this
repo is by far the cheapest** (cents/video). Reach for **Veo 3.1 fast (~$0.05–0.15/sec)**
when a topic genuinely needs synthetic scenes or a talking subject — it's the best
price/quality for shorts-with-audio. Use Nano Banana only for the still images/keyframes
feeding it, not as a video source. To wire a generative model in, add a `veo` branch in
`frpipe/visuals.py` that returns a finished audio+video clip and have `generate.py` skip
the TTS/caption stages for that path (left as a clearly-marked extension point).

## Going fully automated (the "while you sleep" part)

`run.py` is intentionally a one-shot CLI so you can wire it into whatever scheduler you
trust. Pick one:

- **cron** — `0 9,17 * * * cd /path/faceless-reels && .venv/bin/python run.py --topics-file topics.txt --publish`
- **n8n / Make.com** — call `run.py` from an Execute Command node on a schedule; both
  have ready-made faceless-video templates you can crib the trigger logic from.
- **GitHub Actions** — a `schedule:` workflow that runs the CLI and posts (keys as repo secrets).

Start in **review mode** (no `--publish`) for the first dozen videos until the niche,
voice, and caption style look right — then flip the scheduler to `--publish`.

## Cost reality

At free-tier TTS + free stock + local Whisper, the only metered cost is the Claude
script call (cents) and, past 10 posts/month, Upload-Post. A daily-posting channel runs
**a few dollars a month** vs. the $19–69/mo subscription — and you own the output, the
niche data, and the cadence.

## Legal / platform note

Automated posting must follow each platform's API terms and rate limits (the native
APIs above are the sanctioned route; headless-browser bots are the bannable one). Don't
post AI content into niches that require disclosure without disclosing it. This is a
tool; how you use it is on you.
