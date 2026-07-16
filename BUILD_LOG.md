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

## 2026-07-16 — First runnable vertical slice

- Implemented a dependency-free Node.js web application and visual studio.
- Added a sample laboratory ontology and a versioned strict taxonomy.
- Implemented stable ontology hashing, lightweight ontology linting, path validation, taxonomy compilation, and fail-closed decision records.
- Added `ADMIT`, `HUMAN_REVIEW`, and `HARD_REFUSE` governance states.
- Added explicit epistemic provenance: model proposals are untrusted; ontology edges and compiled policy are authoritative.
- Connected GPT-5.6 through the Responses API with strict JSON Schema output.
- Added eight fixed BEM-RITE-inspired adversarial and role-boundary probes.
- Verified six engine tests, an 8/8 stress suite, and a live `ADMIT / AUTHORIZED_PATH` request.
- Visually inspected the four-area interface and confirmed no browser console errors.
- Published the runnable source, sample data, and tests to the public repository.

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

### DR-004 — Framework selection, not framework accumulation

**Decision:** Use UFO-MON, AGPF, epistemic provenance, speech-act routing, and BEM-RITE only where they create an executable check or visible evaluation.

**Reason:** The product must remain understandable in a three-minute demo. Predictive processing, Theory of Mind, conceptual blending, social identity, enactivism, and full belief revision are deferred.

### DR-005 — Three-way governed decision

**Decision:** Structural failures are hard refusals. Ambiguity and governed change requests route to human review.

**Reason:** A missing graph edge cannot be overridden at runtime, while a legitimate policy or ontology change requires accountable human authority.
