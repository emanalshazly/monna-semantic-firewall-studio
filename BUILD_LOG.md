# Build Week Log

This log records major decisions and evidence of work performed during OpenAI Build Week. Commit history and Codex session records provide the detailed implementation trail.

## 2026-07-16 — Project initialization

- Registered the project concept for OpenAI Build Week.
- Selected the name **MONNA Semantic Firewall Studio**.
- Selected the tagline **The model interprets. The graph decides.**
- Defined the primary audience and testable security claim.
- Separated GPT-5.6 interpretation from deterministic authorization.
- Created the public project plan and pre-existing work disclosure.
- Created a dedicated OpenAI project API key stored locally in an ignored environment file.
- Created the public GitHub repository.

## Decision record

### DR-001 — Deterministic final authority

**Decision:** GPT-5.6 proposes structured candidate paths, but code makes the final authorization decision.

**Reason:** Model confidence cannot prove that a class or relationship exists in the deployed ontology.

### DR-002 — Narrow security claim

**Decision:** Do not claim universal prompt-injection prevention.

**Reason:** The MVP can directly test whether unsupported semantic paths are refused. Broader security guarantees require evidence outside the hackathon scope.

### DR-003 — JSON ontology first

**Decision:** Support a constrained JSON ontology format in the MVP.

**Reason:** It permits reliable graph validation, a strong demo, and complete testing within the submission window. RDF/OWL support remains a post-MVP extension.


