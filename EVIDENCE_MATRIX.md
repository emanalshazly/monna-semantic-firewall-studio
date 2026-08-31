# Evidence matrix

| Claim surface | Evidence in this repository | Status |
|---|---|---|
| Deterministic graph/taxonomy decisions | `npm test`, fixed stress cases, `EVALUATION_REPORT.md` | Deterministically reproducible |
| 30/30 fixed-case result | `data/stress-cases.json` executed by the Node test suite | Deterministically reproducible |
| Live GPT interpretation quality | No versioned run receipt or judged fixture | Unverified |
| Browser smoke behavior | No current clean-clone browser receipt | Unverified |
| Public deployment | No GitHub deployment or committed demo receipt | Not claimed |
| Production security | Out of scope | Not claimed |

CI validates only the deterministic engine. A future live-model receipt must record the commit SHA, UTC timestamp, model identifier, input fixture hash, raw structured proposal, expected interpretation, reviewer, and result. It must not be merged into the deterministic 30/30 score.
