# Pitch Kit

Fill-in-the-blank templates for demo day. See also [notes.md](notes.md) for the running demo script/limitations doc the team keeps updated live.

## 3-Minute Pitch (elevator version)

1. **Hook (15s):** "[One-sentence relatable problem in the automotive space]."
2. **Problem (30s):** Who has this problem, how big is it, why does it matter to Stellantis specifically.
3. **Solution (30s):** "We built [product name], which [core value prop in one sentence]."
4. **Live demo (60s):** Golden path only — the one flow that best shows the value. Rehearse this exact sequence, no improvising.
5. **Tech highlight (20s):** One sentence on what's technically interesting (e.g. "deterministic health scoring, with Groq only ever explaining scores it never computed").
6. **Close (15s):** Impact statement + what's next.

## 5-Minute Pitch (full version)

1. **Problem statement (45s):** Real-world scenario, who's affected, cost/impact today.
2. **Solution overview (45s):** What you built and why this approach.
3. **Live demo (2 min):** Golden path + one "wow" secondary feature if time allows. Have a fallback (recording/screenshots) ready — see [notes.md](notes.md).
4. **Tech highlights (45s):** Architecture in one diagram (see `docs/architecture/overview.md`), what was genuinely hard, what AI does under the hood.
5. **Business impact (30s):** Cost savings / safety / efficiency gain — quantify if you can, even roughly.
6. **Future scope (15s):** 2-3 concrete next steps, not a vague "we'd add more features."

## Judge FAQ (draft answers ahead of time)

| Likely question | Draft answer |
|---|---|
| "What would you build next with more time?" | [specific, not "everything"] |
| "How does this scale beyond the demo data?" | [honest answer about mock vs real data, DB choice] |
| "What was the hardest technical part?" | [pick one real thing, be specific] |
| "How is this different from [existing solution]?" | [differentiator] |
| "What's the business model / cost to deploy?" | [rough honest estimate] |
| "Is the AI output reliable / how do you handle hallucination?" | [mention that Groq only ever receives already-computed scores + raw telemetry - it explains, never invents numbers - plus the system prompt constraint in ai/src/prompts.py] |
| "What did you NOT get to finish?" | [be honest — judges respect this more than overselling] |

## Innovation & Future Scope talking points
- Innovation: [what's novel about your approach, not just the tech stack]
- Future scope: [3 bullet points, concrete and buildable, not aspirational]

## Demo Script
See [notes.md](notes.md) for the step-by-step demo script and fallback plan — keep that one updated as the actual build takes shape; this file is the pitch narrative around it.
