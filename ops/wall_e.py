#!/usr/bin/env python3
"""WALL-E — autonomous watcher brain for the faceless-reels generator.

Runs in GitHub Actions on a schedule.

  * No LLM key set  -> reflex mode: re-run failed generator jobs + post a heartbeat.
  * WALLE_* set      -> MiniMax M3 diagnoses failures and decides self-heal vs escalate.
  * WALLACE_* set    -> a heavier model writes a deep diagnosis on escalated failures.

All status + escalations go to one pinned GitHub issue. WALL-E NEVER edits code or
posts content — publishing, spending, and code merges stay with a human, by design.
"""
from __future__ import annotations

import json
import os

import httpx

GH = "https://api.github.com"
REPO = os.environ["GITHUB_REPOSITORY"]              # "owner/name" (auto-set by Actions)
TOKEN = os.environ["GITHUB_TOKEN"]
GEN_WF = os.environ.get("GENERATOR_WORKFLOW", "faceless-reels.yml")
BRANCH = os.environ.get("WATCH_BRANCH", "")
ISSUE_MARKER = "<!-- wall-e-status -->"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


def gh(method: str, path: str, **kw) -> httpx.Response:
    r = httpx.request(method, f"{GH}{path}", headers=HEADERS, timeout=30,
                      follow_redirects=True, **kw)
    r.raise_for_status()
    return r


def latest_run() -> dict | None:
    runs = gh("GET", f"/repos/{REPO}/actions/workflows/{GEN_WF}/runs?per_page=10").json()
    cron_runs = [r for r in runs.get("workflow_runs", [])
                 if r["event"] in ("schedule", "workflow_dispatch")]
    return cron_runs[0] if cron_runs else None


def failed_logs(run_id: int, limit: int = 12000) -> str:
    jobs = gh("GET", f"/repos/{REPO}/actions/runs/{run_id}/jobs").json().get("jobs", [])
    chunks = []
    for j in jobs:
        if j.get("conclusion") == "failure":
            try:
                txt = gh("GET", f"/repos/{REPO}/actions/jobs/{j['id']}/logs").text
            except Exception as e:  # noqa: BLE001
                txt = f"(could not fetch logs: {e})"
            chunks.append(f"# job: {j['name']}\n{txt[-limit:]}")
    return "\n\n".join(chunks)[-limit:]


def rerun_failed(run_id: int) -> None:
    gh("POST", f"/repos/{REPO}/actions/runs/{run_id}/rerun-failed-jobs")


def dispatch() -> None:
    if BRANCH:
        gh("POST", f"/repos/{REPO}/actions/workflows/{GEN_WF}/dispatches",
           json={"ref": BRANCH})


def upsert_issue(body: str, comment: bool = True) -> None:
    issues = gh("GET", f"/repos/{REPO}/issues?state=open&per_page=100").json()
    target = next((i for i in issues if ISSUE_MARKER in (i.get("body") or "")), None)
    if target:
        gh("PATCH", f"/repos/{REPO}/issues/{target['number']}",
           json={"body": f"{ISSUE_MARKER}\n\n{body}"})
        if comment:
            gh("POST", f"/repos/{REPO}/issues/{target['number']}/comments", json={"body": body})
    else:
        gh("POST", f"/repos/{REPO}/issues",
           json={"title": "🤖 WALL-E status", "body": f"{ISSUE_MARKER}\n\n{body}"})


def llm(prefix: str):
    """Return (client, model) for WALLE_/WALLACE_ env vars, or None if not configured."""
    key = os.environ.get(f"{prefix}_API_KEY")
    model = os.environ.get(f"{prefix}_MODEL")
    if not key or not model:
        return None
    from openai import OpenAI  # OpenAI-compatible; MiniMax M3 exposes this interface
    return OpenAI(api_key=key, base_url=os.environ.get(f"{prefix}_BASE_URL") or None), model


def ask(brain, system: str, user: str) -> str:
    client, model = brain
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0,
    )
    return resp.choices[0].message.content or ""


def _json(s: str) -> dict:
    s = s.strip()
    i, j = s.find("{"), s.rfind("}")
    return json.loads(s[i:j + 1]) if i >= 0 and j > i else json.loads(s)


def main() -> None:
    run = latest_run()
    if not run:
        dispatch()
        upsert_issue("**WALL-E:** no prior generator runs found — dispatched one.")
        return

    num, concl, status, url = (run["run_number"], run.get("conclusion"),
                               run["status"], run["html_url"])

    if status != "completed":
        upsert_issue(f"**WALL-E heartbeat:** run #{num} is `{status}`. [run]({url})", comment=False)
        return
    if concl != "failure":
        upsert_issue(f"**WALL-E heartbeat:** ✅ run #{num} = `{concl}`. Generator healthy. "
                     f"[run]({url})", comment=False)
        return

    # --- failure path ---
    logs = failed_logs(run["id"])
    brain = llm("WALLE")
    if not brain:
        rerun_failed(run["id"])
        upsert_issue(f"**WALL-E (reflex):** ❌ run #{num} failed — re-ran the failed jobs. "
                     f"(No brain key set, so no diagnosis.) [run]({url})")
        return

    sys_prompt = (
        "You are WALL-E, an ops watcher for an automated short-form video pipeline. "
        "You are given CI failure logs. Respond with ONLY JSON: "
        '{"cause": "<one line>", "action": "rerun"|"escalate"|"none", '
        '"summary": "<2-3 plain-English sentences>"}. '
        "Use action=rerun for transient issues a re-run fixes (rate limits, timeouts, "
        "flaky network, temporary 5xx). Use action=escalate for code/config bugs, "
        "missing secrets, or anything a re-run will not fix."
    )
    try:
        v = _json(ask(brain, sys_prompt, logs[-10000:]))
    except Exception as e:  # noqa: BLE001
        v = {"cause": "unparseable brain output", "action": "escalate",
             "summary": f"WALL-E's brain returned output it couldn't parse ({e})."}

    lines = [f"**WALL-E:** ❌ run #{num} failed. [run]({url})",
             f"- **Cause:** {v.get('cause')}",
             f"- {v.get('summary')}"]

    if v.get("action") == "rerun":
        rerun_failed(run["id"])
        lines.append("- **Action:** transient → re-ran the failed jobs. 🔁")
    elif v.get("action") == "escalate":
        wallace = llm("WALLACE")
        if wallace:
            deep = ask(wallace,
                       "You are Wallace, a senior engineer. Diagnose this CI failure and give a "
                       "concrete recommended fix (file + change). Be concise. Do NOT make changes "
                       "yourself — a human will review and apply.",
                       logs[-20000:])
            lines.append("- **Action:** escalated to Wallace.\n\n"
                         "<details><summary>Wallace diagnosis</summary>\n\n" + deep + "\n\n</details>")
        else:
            lines.append("- **Action:** ⚠️ needs a human — a re-run won't fix this "
                         "(set WALLACE_* to get an auto-diagnosis).")
    else:
        lines.append("- **Action:** none taken.")

    upsert_issue("\n".join(lines))


if __name__ == "__main__":
    main()
