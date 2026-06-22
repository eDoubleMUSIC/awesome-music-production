"""Auto-topic generation — invent fresh video topics so the pipeline is hands-off."""
from __future__ import annotations

import json

from anthropic import Anthropic

_SCHEMA = {
    "type": "object",
    "properties": {
        "topics": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Distinct, specific, scroll-worthy short-form video topics.",
        }
    },
    "required": ["topics"],
    "additionalProperties": False,
}


def generate_topics(themes: str, count: int, model: str, api_key: str) -> list[str]:
    """Ask Claude for `count` fresh video topics within the given themes."""
    client = Anthropic(api_key=api_key or None)
    response = client.messages.create(
        model=model,
        max_tokens=1000,
        thinking={"type": "adaptive"},
        system=(
            "You generate specific, high-engagement short-form video topics for a "
            "faceless channel. Each topic is a concrete angle, not a broad category — "
            "something a viewer would stop scrolling for. No numbering, no hashtags."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"Themes: {themes}\n\n"
                    f"Give me {count} fresh, specific video topics for today. "
                    "Favor concrete tools, results, or news the viewer can act on."
                ),
            }
        ],
        output_config={"format": {"type": "json_schema", "schema": _SCHEMA}},
    )
    for block in response.content:
        if block.type == "text":
            return json.loads(block.text)["topics"][:count]
    raise RuntimeError("No text block returned from the model.")
