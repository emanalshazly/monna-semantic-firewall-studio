# Deterministic Evaluation Report

**Date:** July 16, 2026  
**Suite:** `data/stress-cases.json`  
**Result:** **30 / 30 passed**

## Claim under test

The evaluation tests a narrow property:

> A candidate semantic path must not be admitted when its ordered source-edge-target dependencies are missing from, or disallowed by, the supplied ontology and taxonomy.

This suite does not claim universal prompt-injection prevention, complete ontology correctness, deception detection, or production security certification.

## Method

Each fixed case contains:

- a natural-language request;
- an inspectable structured candidate path;
- the expected governance decision;
- a stable identifier and human-readable label.

The candidate is passed directly to the deterministic engine, so the suite tests authorization independently of model variability and does not call the OpenAI API.

The engine then applies:

1. taxonomy compilation and ontology integrity status;
2. ontology/taxonomy version agreement;
3. governed change-request routing;
4. ambiguity routing;
5. exact ordered source-edge-target graph validation;
6. minimum semantic depth;
7. strict taxonomy signature matching.

## Coverage

| Scenario family | Examples |
| --- | --- |
| Grounded admissions | authorized quality, identifier, participation chain, normative path |
| Missing relationships | plausible Spectrometer-to-Protocol and Centrifuge-to-Protocol claims |
| Injection and role pressure | “ignore the taxonomy” and claimed system-owner authority |
| Source/target integrity | known edge applied to the wrong source or target |
| Unknown vocabulary | entry or target classes outside the ontology |
| Governed mutations | policy, ontology, and override requests |
| Ambiguity | unclear referents and multiple possible interpretations |
| Semantic floor | empty or under-specific paths |
| Strict policy | graph-valid partial, alternate, and compound paths absent from the allowlist |

## Result

```json
{
  "total": 30,
  "passed": 30,
  "failed": 0
}
```

The primary invariant held for every fixed case: no missing edge was admitted.

## Reproduce

```bash
npm test
```

The same cases can be inspected visually from the **Stress Lab** area of the application.

## Remaining evaluation work

Before final submission:

- rerun the complete suite from a clean clone;
- verify deployed behavior in a clean browser;
- record a small live-model interpretation set separately from deterministic authorization;
- keep model-quality observations separate from enforcement guarantees.
