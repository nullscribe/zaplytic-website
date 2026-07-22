---
slug: ai-code-review-glm-5-2
title: "Putting GLM-5.2 on Code Review Duty: What It Catches, What It Misses, and Where It Wastes Time"
description: "A practical guide to setting up AI-assisted code review with GLM-5.2 — the prompts that work, the false positives that don't, and how to keep humans in the loop without making them hate the bot."
date: "2026-02-11"
author: "Jahid Hasan"
tags: [ai, glm, code-review, devops, llm]
featured: true
---

We've all been in the PR review where the reviewer skimmed the diff, typed "looks good", and approved. Code review is one of the highest-leverage quality activities in software development, and it's also the one most consistently done badly. AI-assisted review won't replace human reviewers, but it can make them dramatically more effective — if you set it up correctly. I've been running GLM-5.2 as a first-pass reviewer on every PR for three months now, and this is what I've learned.

### Why GLM-5.2 and Not the Others?

I compared three frontier models for code review (full comparison in my previous post), and GLM-5.2 won this specific use case for three reasons:

1.  **Cost.** Code review means diffing every PR, which means a lot of calls. At GLM-5.2's pricing ($3/M input, $15/M output), reviewing a typical 500-line PR costs roughly $0.05. Claude Fable would cost $0.25 for the same work. Over hundreds of PRs per month, this adds up fast.
2.  **Structured output reliability.** GLM-5.2 consistently produces well-formed JSON when asked to, which matters when you're parsing review comments programmatically and posting them back to GitHub.
3.  **Appropriate confidence.** The model is willing to say "this looks fine" rather than inventing issues to seem thorough. This is the single most important quality in a code reviewer, human or AI.

### The Setup

The architecture is simple: a GitHub Actions workflow that triggers on PR open and PR update, sends the diff to GLM-5.2 via API, parses the structured response, and posts comments back to the PR.

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: read
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - name: Run AI Review
        env:
          GLM_API_KEY: ${{ secrets.GLM_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/ai-review.mjs
```

The review script itself is straightforward. The important part is the system prompt — this is where most people go wrong. A bad prompt produces either a wall of useless comments or a silent bot that rubber-stamps everything.

```javascript
// scripts/ai-review.mjs
const SYSTEM_PROMPT = `You are a senior code reviewer. Review the following PR diff.

Focus on, in priority order:
1. Security issues (injection, auth bypass, secret leakage)
2. Correctness bugs (race conditions, null derefs, logic errors)
3. Performance issues (N+1 queries, unnecessary allocations, missing indexes)
4. Maintainability (unclear naming, missing error handling, magic numbers)

Rules:
- Only comment on real issues. Do not comment on style preferences.
- If you are not confident an issue is real, do not report it.
- For each comment, quote the exact line, explain the problem, and suggest a fix.
- If the diff has no real issues, respond with an empty array.
- Respond as JSON: [{"file": "path", "line": 42, "severity": "high|medium|low", "comment": "..."}]
- "high" = security or correctness bug. "medium" = performance or maintainability. "low" = minor.

Be honest. An empty review is a good review.`;
```

The critical instruction is the last one. Without it, most LLMs will generate at least one comment on every PR, because they've been trained to be "helpful". In code review, that behaviour is actively harmful — it trains developers to ignore the bot.

### What GLM-5.2 Actually Catches

Over three months and 847 PRs reviewed, here's what the data looks like:

- **Total PRs reviewed:** 847
- **PRs with at least one comment:** 312 (37%)
- **Total comments posted:** 489
- **Comments marked "high" severity:** 71
- **Comments acted on by developers (changed the code):** 298 (61% of all comments)
- **False positives (developer dismissed):** 112 (23%)
- **Comments that sparked useful discussion but no code change:** 79 (16%)

The 61% action rate is the number I care about most. It means the majority of comments are valuable enough that a developer changed their code in response. For comparison, an earlier experiment with a different model had a 34% action rate and a 52% false positive rate — developers started ignoring the bot within two weeks.

The high-severity catches break down roughly as:

- **SQL injection or unsafe query construction:** 14 instances (the model is very good at this)
- **Authentication/authorisation bypass:** 9 instances (missing permission checks on new endpoints)
- **Secret leakage (logged tokens, hardcoded credentials):** 12 instances
- **Race conditions in concurrent code:** 8 instances
- **Null/undefined dereference that tests missed:** 18 instances
- **Incorrect error handling (swallowed exceptions, wrong status codes):** 10 instances

The SQL injection and secret leakage catches alone have paid for the entire setup many times over. GLM-5.2 is genuinely excellent at spotting string-interpolated SQL and `console.log` statements that leak tokens — patterns that human reviewers skim past because they look "normal" in context.

### The False Positives That Waste Time

The 23% false positive rate is the painful part. The most common false positives:

**1. Over-flagging dynamic SQL that is actually safe.** The model sometimes flags any string that touches SQL, even when parameterised queries are being used correctly. This is the single biggest source of noise. The fix: include the surrounding context (the query builder or ORM setup) in the diff so the model can see the parameterisation.

**2. Flagging intentional patterns as bugs.** In our codebase, we have a deliberate "fail open" pattern for non-critical feature flags — if the flag service is unreachable, we default to enabled. The model flags this as "swallowed error" every time. The fix: add a `// ai-review: intentional fail-open` comment that the review script filters on.

**3. Hallucinated API methods.** Occasionally the model suggests calling a method that doesn't exist on the class. This happens most with internal libraries the model hasn't seen. The fix: keep a `CONTEXT.md` file with key internal APIs and include it in the prompt.

**4. Over-cautious security flags on internal tools.** For internal admin tools, the model flags missing auth checks that are intentionally absent (the tool runs behind an authenticated reverse proxy). The fix: tag internal-only code in `CODEOWNERS` and adjust the prompt based on file path.

### Keeping Humans in the Loop

The biggest mistake I see teams make is treating AI review as a replacement for human review. It is not. It is a first-pass filter that makes human review better. Here's the workflow that works for us:

1.  **PR opened → AI review runs immediately.** The developer gets feedback within 60 seconds, before they've even context-switched away.
2.  **Developer addresses AI comments** (fixes real issues, dismisses false positives with a reason).
3.  **Human reviewer sees the PR with AI comments already addressed.** Their job is now focused on architecture, business logic, and things the AI can't see (does this fit the product direction? is this the right feature?).

This roughly halved our average PR review time, because human reviewers stopped spending time on the mechanical stuff (missing null checks, N+1 queries, unsafe SQL) and started spending time on the things that actually require human judgement.

### The Prompt Engineering That Actually Matters

A few prompt techniques that materially improved the quality of reviews:

**Include the file's purpose.** I added a line to the script that pulls the first comment from each file and includes it as context. The model reviews much better when it knows whether it's looking at a controller, a model, or a test.

**Ask for severity calibration.** The three-tier severity system (high/medium/low) lets developers filter and prioritise. Without it, every comment feels equally urgent (or equally ignorable).

**Tell it what not to comment on.** Explicitly listing "do not comment on: formatting, import order, variable names that follow existing conventions" cuts noise by roughly 40%.

**Use few-shot examples of good and bad comments.** I include three examples in the prompt: one real bug the model should have caught, one false positive it should have avoided, and one "empty review is correct" example. This single change dropped the false positive rate from 31% to 23%.

### Cost and Latency in Practice

Over three months:

- **Total API spend:** $42.30 (847 PRs, ~$0.05 per review on average)
- **Average review latency:** 8 seconds (small PRs) to 45 seconds (large PRs with 1000+ line diffs)
- **PRs where the review failed (API error, timeout):** 11 (1.3%, all retried successfully)

For context, the cheapest human reviewer on the team costs roughly $30/hour. If they spend even 15 minutes per PR on mechanical review, that's $7.50 per PR — 150x the cost of the AI. The AI doesn't replace the human, but it does the part the human is worst at enjoying, for 1/150th the cost.

### Conclusion: The Reviewer That Never Gets Tired

AI-assisted code review with GLM-5.2 has been one of the highest-ROI engineering investments we've made. The setup cost was a weekend. The ongoing cost is negligible. The quality improvement is real and measurable — fewer bugs reach production, PRs review faster, and human reviewers spend their time on work that requires judgement instead of pattern-matching.

The key insight is that the model is not the product. The prompt, the feedback loop, the false-positive reduction, the integration with your existing review culture — that's the product. The model is just the engine. A well-integrated GLM-5.2 reviewer will outperform a poorly integrated Claude Fable reviewer, every time. Invest in the integration, not the model.
