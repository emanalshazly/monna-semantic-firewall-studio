# Pre-existing Work Disclosure

This file distinguishes conceptual work that existed before the runnable OpenAI Build Week implementation from work created during the hackathon submission period.

## Before the runnable Build Week implementation

The author had developed conceptual documents and operational prompt designs for an ontology capability chain:

```text
Capability Prober -> Taxonomy Compiler -> Bounded Interpretive Firewall
```

The prior material included:

- The principle: **the floor is policy; the ceiling is the ontology**.
- Proposed JSON shapes for taxonomy and firewall decisions.
- Prompt-level descriptions of Prober, Compiler, and Firewall responsibilities.
- Synthetic laboratory examples.
- Early cross-model prompt testing, including limited use of Claude.

These materials were design artifacts, not the runnable web application submitted for judging.

## Build Week implementation scope

The judged extension will include newly implemented and documented work such as:

- A runnable application and user interface.
- Deterministic ontology parsing and graph validation.
- JSON Schemas and stable artifact versioning.
- GPT-5.6 structured path extraction.
- Runtime `ADMIT`/`REFUSE` enforcement.
- Fail-closed error handling.
- Automated unit, integration, and adversarial tests.
- A visual graph-path explanation.
- A judge-ready sample environment and public deployment.

## Tool disclosure

Early conceptual exploration and prompt testing included Claude. The runnable Build Week implementation, significant product extension, validation engine, user experience, tests, and deployment are being developed with Codex and GPT-5.6.

This disclosure will be updated as the implementation evolves.


