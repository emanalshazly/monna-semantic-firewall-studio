# OpenAI Build Week Project Plan

## Product definition

**Name:** MONNA Semantic Firewall Studio  
**Tagline:** The model interprets. The graph decides.  
**Submission deadline:** July 21, 2026 at 5:00 PM Pacific Time  
**Internal freeze target:** July 21, 2026 at 6:00 PM Europe/Istanbul

## User and problem

### Primary user

Developers and AI platform teams building agents over ontologies, knowledge graphs, structured retrieval systems, or controlled enterprise vocabularies.

### Job to be done

Before an agent answers or acts, determine whether the required semantic path is grounded in the authorized ontology and permitted by the deployed taxonomy.

### Core promise

GPT-5.6 interprets natural language and proposes a candidate path. Deterministic graph validation makes the authorization decision.

## MVP scope

### 1. Ontology workspace

- Accept a safe JSON ontology format.
- Validate the input against JSON Schema.
- Compute a stable ontology reference or hash.
- Display classes, properties, and edges as an interactive graph.
- Provide at least one built-in sample ontology for immediate judging.

### 2. Capability Prober

- Traverse the ontology graph and enumerate supported path signatures.
- Generate initial question archetypes with entry class, ordered edges, depth, and target.
- Mark unsupported or unclassifiable entries explicitly.
- Keep generated artifacts deterministic for identical inputs.

### 3. Taxonomy Compiler

- Accept Prober output and optional operator additions.
- Treat operator additions as untrusted data.
- Ask GPT-5.6 for structured candidate paths.
- Verify every proposed class and edge against the graph.
- Reject missing-edge and ambiguous additions.
- Deduplicate identical ordered path signatures.
- Emit a versioned taxonomy with mandatory rejection ledgers.

### 4. Runtime Semantic Firewall

- Accept an incoming natural-language question.
- Obtain a structured candidate path from GPT-5.6.
- Reject invalid model output by default.
- Apply deterministic grounding, floor, ceiling, and version checks.
- Support `STRICT` and `PATH_VALIDITY` modes.
- Return a structured `ADMIT` or `REFUSE` decision with a concise reason.
- Never forward refused questions to an answer-generating system.

### 5. Visual explanation and audit

- Highlight the proposed and validated graph path.
- Show the failed check without revealing the full allowlist.
- Record ontology reference, taxonomy version, mode, path, decision, and reason.
- Allow judges to download an audit record as JSON.

## Decision contract

```json
{
  "decision": "ADMIT",
  "reason": "OK",
  "classified_path": {
    "entry_class": "Centrifuge",
    "edges": ["maxRPM"],
    "depth": 1,
    "target": "xsd:int"
  },
  "matched_archetype": "prop-maxRPM-d1",
  "mode": "STRICT",
  "ontology_ref": "sha256:...",
  "taxonomy_version": "tax-20260716-01"
}
```

## Non-goals for the hackathon MVP

- Full OWL reasoner compatibility.
- Enterprise authentication or multi-tenant administration.
- Automatic ontology generation from documents.
- A universal prompt-injection prevention claim.
- A production compliance certification.
- Large-scale persistent storage.
- Complete implementation of every ambiguity taxonomy subtype.

## Architecture

```text
Ontology JSON
    -> deterministic parser and schema validation
    -> graph representation
    -> Capability Prober
    -> Taxonomy Compiler
        <- operator additions
        <- GPT-5.6 structured path proposal
    -> versioned taxonomy

Incoming question
    -> GPT-5.6 structured path proposal
    -> deterministic graph and taxonomy checks
    -> ADMIT or REFUSE
    -> visual explanation and audit record
```

## OpenAI usage

### GPT-5.6

- Map natural-language questions to structured candidate paths.
- Identify ambiguous or compound interpretations.
- Produce schema-constrained output for deterministic validation.

### Codex

- Implement the application and validation engine.
- Generate and review tests.
- Build the visual interface.
- Run adversarial evaluations and repair failures.
- Prepare deployment and submission materials.

GPT-5.6 will not be the final authorization authority. Candidate paths are always validated by code.

## Evaluation plan

The initial benchmark will contain at least 30 fixed cases covering:

- Clean admission.
- Unknown classes.
- Missing relationships.
- Questions below the semantic floor.
- Valid paraphrases.
- Ambiguous and compound questions.
- Prompt-injection text inside questions.
- Instruction text inside operator additions.
- Invalid structured model output.
- Ontology/taxonomy version mismatch.
- `STRICT` versus `PATH_VALIDITY` divergence.
- Model-proposed edges absent from the graph.

### Primary success condition

Every candidate path containing a nonexistent edge must be refused by deterministic validation, even when the model proposes the path confidently.

## Delivery schedule

### July 16 — Foundation

- Publish plan and provenance baseline.
- Scaffold the application.
- Define ontology, taxonomy, and decision schemas.
- Implement deterministic graph parsing and validation.

### July 17 — Compiler

- Implement operator additions and path validation.
- Add signature deduplication, floor policy, hashing, and versioning.
- Create the first fixed benchmark fixtures.

### July 18 — GPT-5.6 and firewall

- Implement structured path extraction.
- Add fail-closed handling and the two enforcement modes.
- Complete the decision and audit contracts.

### July 19 — Product experience

- Build ontology graph visualization.
- Build compiler workspace and firewall playground.
- Add sample data and one-click judging flow.

### July 20 — Evaluation and deployment

- Run the benchmark and adversarial tests.
- Repair failures and document limitations.
- Deploy the public demo and complete testing instructions.

### July 21 — Submission

- Freeze the judged build.
- Record a public demo video shorter than three minutes.
- Complete the Devpost story, screenshots, repository access, and Codex `/feedback` Session ID.

## Three-minute demo script

1. Explain the unsupported-relationship problem.
2. Load the laboratory ontology and show its graph.
3. Compile a valid centrifuge addition and merge it with an existing signature.
4. Reject a spectrometer-to-protocol addition because its edge is absent.
5. Run a valid question and receive `ADMIT`.
6. Run the unsupported question and receive `REFUSE`.
7. Add an injection instruction to the refused question and show the same refusal.
8. Close with: **The model interprets. The graph decides.**

## Definition of done

- A public, runnable demo is available without paid access.
- A judge can complete the sample flow in under two minutes.
- Repository setup instructions are reproducible.
- All fixed missing-edge tests pass.
- Invalid model output fails closed.
- No secret is committed.
- Pre-existing work and Build Week additions are clearly distinguished.
- The README documents how Codex and GPT-5.6 contributed.


