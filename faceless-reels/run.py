#!/usr/bin/env python3
"""CLI entry point for the faceless-reels pipeline.

Examples:
    python run.py --topic "the myth of Icarus"
    python run.py --topic "3 synthwave tricks" --publish
    python run.py --topics-file topics.txt --publish
"""
from __future__ import annotations

import argparse
from pathlib import Path

from frpipe.config import load_config
from frpipe.generate import make_video


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate (and optionally post) faceless reels.")
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--topic", help="A single topic to make a video about.")
    src.add_argument("--topics-file", help="Path to a file with one topic per line.")
    parser.add_argument("--config", default="config.yaml", help="Path to config.yaml")
    parser.add_argument("--out", default="out", help="Output directory")
    parser.add_argument("--publish", action="store_true", help="Publish after generating")
    args = parser.parse_args()

    cfg = load_config(args.config)
    out_root = Path(args.out)

    if args.topic:
        topics = [args.topic]
    else:
        topics = [
            line.strip()
            for line in Path(args.topics_file).read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.startswith("#")
        ]

    for topic in topics:
        print(f"\n=== {topic} ===")
        result = make_video(topic, cfg, out_root, do_publish=args.publish)
        print(f"  -> {result['video']}")
        if "publish" in result:
            print(f"  -> published: {result['publish']}")


if __name__ == "__main__":
    main()
