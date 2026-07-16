# MONNA Semantic Firewall Studio

> **The model interprets. The graph decides.**

A deterministic semantic firewall for ontology-grounded AI agents, being built for OpenAI Build Week 2026.

## Status

This repository currently contains the public build plan and provenance record. The runnable hackathon implementation is in active development.

## Problem

AI agents can produce convincing answers that depend on relationships absent from their authorized knowledge source. Confidence is not permission: a language model may infer a plausible path that the deployed ontology never defined or approved.

MONNA Semantic Firewall Studio separates language interpretation from authorization. GPT-5.6 proposes an inspectable candidate path; deterministic code validates every class and edge against the ontology and compiled taxonomy before returning `ADMIT` or `REFUSE`.

## Planned product

The Build Week MVP has three connected components:

1. **Capability Prober** — discovers supported paths and question archetypes from an ontology.
2. **Taxonomy Compiler** — validates generated and operator-added archetypes, deduplicates path signatures, and creates a versioned taxonomy.
3. **Semantic Firewall** — classifies incoming questions, applies floor and ceiling checks, and produces an auditable decision.

The visual studio will include an ontology graph, compiler workspace, live firewall playground, sample scenarios, and downloadable audit records.

## Security principle

> **The floor is policy. The ceiling is the graph.**

Operators may configure minimum specificity. They may not authorize a relationship that does not exist in the ontology.

## Build Week documentation

- [Project plan](PROJECT_PLAN.md)
- [Pre-existing work disclosure](PREEXISTING-WORK.md)
- [Build log](BUILD_LOG.md)

## Responsible claims

This project is an experimental defensive developer tool. It does not claim to eliminate prompt injection, guarantee ontology correctness, or replace application-level authorization. Its goal is narrower and testable: deterministically refuse semantic paths that are missing from, ambiguous within, or disallowed by the supplied ontology and taxonomy.

## Hackathon track

Developer Tools — agentic workflows and security.

## Author

MONNA Consulting — Eman Alshazly


