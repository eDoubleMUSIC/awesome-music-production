# WALL-E — autonomous watcher

WALL-E keeps the `faceless-reels` generator running without a human. It runs every
4 hours on GitHub Actions (`.github/workflows/wall-e.yml`), so it survives any chat
session ending — there's no Claude process in the loop.

## What it does (and doesn't)

| Tier | Brain | Does |
|------|-------|------|
| Reflex (default, no keys) | — | Re-runs failed generator jobs; posts a heartbeat. |
| WALL-E | **MiniMax M3** | Reads the failure logs, classifies the cause, self-heals transient failures (re-run), or escalates real bugs. |
| Wallace | a heavier model | On escalation, writes a deep diagnosis + a recommended fix into the issue. |

**Hard human gates — WALL-E never does these:** publish content, spend beyond your
keys, or change/merge code. It only re-runs jobs and reports. A human owns the rest.

## Where it reports

One pinned GitHub issue titled **🤖 WALL-E status** — heartbeats update the issue
body (no notification spam); failures/escalations add a comment so you get pinged.

## Give it a brain (optional)

Reflex mode needs nothing. To add the MiniMax M3 brain, set in the repo
(*Settings → Secrets and variables → Actions*):

| Kind | Name | Example value |
|------|------|---------------|
| Secret | `WALLE_API_KEY` | your MiniMax (or OpenRouter) key |
| Variable | `WALLE_BASE_URL` | `https://api.minimax.io/v1` *or* `https://openrouter.ai/api/v1` |
| Variable | `WALLE_MODEL` | `minimax-m3` *or* `minimax/minimax-m3` (router-specific) |

For the heavier escalation brain (Wallace), set `WALLACE_API_KEY` / `WALLACE_BASE_URL`
/ `WALLACE_MODEL` the same way (any OpenAI-compatible model). MiniMax M3 is OpenAI-API
compatible, so any of its providers (MiniMax direct, OpenRouter, Fireworks) works —
just match the base URL and model string to the provider you signed up with.

> Note: scheduled workflows only fire on the repository's **default branch**, so the
> WALL-E and generator crons start once this is merged to `master`. `workflow_dispatch`
> (the "Run workflow" button) works on any branch for testing.
