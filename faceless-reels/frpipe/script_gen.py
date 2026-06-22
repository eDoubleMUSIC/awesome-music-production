"""Stage 1 — turn a topic into a narration script using the Claude API."""
from __future__ import annotations

from anthropic import Anthropic

# Structured-output schema: a hook line plus the narration body. Keeping the hook
# separate lets us reuse it as the social caption / first on-screen line.
_SCHEMA = {
    "type": "object",
    "properties": {
        "hook": {
            "type": "string",
            "description": "A scroll-stopping first line, under 12 words.",
        },
        "narration": {
            "type": "string",
            "description": "The full voiceover script as plain sentences, no stage directions.",
        },
        "search_terms": {
            "type": "array",
            "items": {"type": "string"},
            "description": "3-6 concrete visual search terms for B-roll matching the script.",
        },
    },
    "required": ["hook", "narration", "search_terms"],
    "additionalProperties": False,
}


def generate_script(topic: str, niche: dict, model: str, api_key: str) -> dict:
    """Return {'hook', 'narration', 'search_terms'} for the given topic."""
    client = Anthropic(api_key=api_key or None)

    target_seconds = niche.get("target_seconds", 30)
    wpm = niche.get("words_per_minute", 165)
    word_budget = int(target_seconds / 60 * wpm)

    system = (
        "You write tight, punchy voiceover scripts for vertical short-form video "
        "(Reels / Shorts / TikTok). The script is read aloud verbatim, so write only "
        "spoken words — no scene directions, no emojis, no markdown, no narrator labels."
    )
    prompt = (
        f"Niche/style: {niche.get('description', '').strip()}\n\n"
        f"Topic for this video: {topic}\n\n"
        f"Write a narration of about {word_budget} words (~{target_seconds}s spoken). "
        "Open with the hook, deliver one clear idea, end on a memorable closing line."
    )

    response = client.messages.create(
        model=model,
        max_tokens=1500,
        thinking={"type": "adaptive"},
        system=system,
        messages=[{"role": "user", "content": prompt}],
        output_config={"format": {"type": "json_schema", "schema": _SCHEMA}},
    )

    # With output_config the model returns a single JSON text block.
    import json

    for block in response.content:
        if block.type == "text":
            return json.loads(block.text)
    raise RuntimeError("No text block returned from the model.")
