# MONNA Semantic Firewall Studio

> **The model interprets. The graph decides.**

A governed semantic firewall for ontology-grounded AI agents, built for OpenAI Build Week 2026.

## What it does

GPT-5.6 converts a natural-language request into a schema-constrained semantic path proposal. The proposal is explicitly marked as untrusted. Deterministic code then checks every class and ordered edge against the active ontology and compiled taxonomy before returning one of three auditable decisions:

- `ADMIT` — the path is grounded and authorized.
- `HUMAN_REVIEW` — the request is ambiguous or attempts a governed change.
- `HARD_REFUSE` — the path is structurally invalid, missing, version-mismatched, or disallowed.

The model interprets language. It never grants authority.

## Why this is different

A conventional prompt guard asks another model whether a request looks safe. MONNA Semantic Firewall Studio checks a narrower, testable property: **does the semantic dependency required by this request exist in the authorized graph, and is that exact ordered path allowed by policy?**

> **The floor is policy. The ceiling is the graph.**

## Studio areas

1. **Runtime Gate** — live GPT-5.6 interpretation followed by deterministic enforcement and downloadable JSON audit records.
2. **Ontology Inspector** — lightweight UFO-informed checks for category declarations, endpoints, duplicates, and event participation.
3. **Policy Compiler** — validation and deduplication of ordered path signatures into a versioned taxonomy.
4. **Stress Lab** — fixed BEM-RITE-inspired probes for missing edges, prompt injection, role pressure, ambiguity, and unauthorized change requests.

## Architecture

```text
Natural-language request
        |
        v
GPT-5.6 structured path proposal  [MODEL_PROPOSAL / untrusted]
        |
        v
Speech-act and provenance routing
        |
        v
Deterministic graph validation
        |
        v
Compiled taxonomy and version checks
        |
        +--> ADMIT
        +--> HUMAN_REVIEW
        +--> HARD_REFUSE
        |
        v
Versioned audit record
```

## Run locally

### Requirements

- Node.js 20 or newer
- A modern browser
- An OpenAI API key with access to GPT-5.6

Supported on Windows, macOS, and Linux wherever Node.js 20+ is available.

### Setup

```bash
git clone https://github.com/emanalshazly/monna-semantic-firewall-studio.git
cd monna-semantic-firewall-studio
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local`.

Add your key to `.env.local`:

```dotenv
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6
PORT=8787
```

Start the studio:

```bash
npm start
```

Open `http://127.0.0.1:8787`.

### Tests

```bash
npm test
```

The deterministic test suite does not call the OpenAI API. The Stress Lab can also be run from the browser.

## Two-minute judge flow

1. Open **Runtime Gate** and run “What is the maximum RPM of the centrifuge?” to show a grounded `ADMIT`.
2. Run “Which protocol belongs to the spectrometer?” to show that a plausible relationship cannot create an ontology edge.
3. Run the injection example to show that instruction text is data, not authority.
4. Open **Ontology Inspector** to see the graph and integrity checks.
5. Open **Policy Compiler** to inspect the exact allowed path signatures and provenance states.
6. Open **Stress Lab**, run the fixed suite, and inspect the transparent per-case results.

## OpenAI usage

### GPT-5.6

- Classifies the request type.
- Produces a strict JSON semantic-path proposal through the Responses API.
- Summarizes the proposed interpretation for inspection.

GPT-5.6 is deliberately **not** the final decision-maker. Invalid model output and API failures fail closed.

### Codex collaboration

Codex was used during Build Week to:

- turn the product concept into a bounded, testable MVP;
- design the JSON ontology, taxonomy, candidate-path, and decision contracts;
- implement the deterministic engine and Responses API integration;
- create the visual product experience and sample data;
- generate and run engine, adversarial, and browser-level checks;
- identify a live-model edge case where cautious interpretation omitted an unsupported step;
- prepare provenance, setup, evaluation, and submission documentation.

The human author made the core product decisions: separating interpretation from authority, choosing the lightweight governance layers, limiting the security claim, and excluding research modules that could not be honestly demonstrated.

## Build Week provenance

This project extends pre-existing MONNA research and design material. Only the runnable implementation and documented Build Week additions are submitted for evaluation.

- [Pre-existing work disclosure](PREEXISTING-WORK.md)
- [Build log](BUILD_LOG.md)
- [Project plan](PROJECT_PLAN.md)
- [Submission checklist](SUBMISSION_CHECKLIST.md)
- [Demo script](DEMO_SCRIPT.md)

Dated repository history and the submitted Codex `/feedback` Session ID provide evidence of work during the submission period.

## Responsible claims

This is an experimental defensive developer tool. It does not claim to eliminate prompt injection, guarantee ontology correctness, detect deception, provide full OWL reasoning, or replace application-level authentication and authorization. Its claim is intentionally narrower: deterministic validation can prevent a model-proposed semantic path from being admitted when the required ordered edges are missing from or disallowed by the supplied graph and taxonomy.

## License

MIT — see [LICENSE](LICENSE).

## Author

MONNA Consulting — Eman Alshazly
