import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { compileTaxonomy, evaluateCandidate, lintOntology, ontologyRef, runStressSuite, validateGraphPath } from "../src/engine.js";

const data = async (file) => JSON.parse(await readFile(new URL(`../data/${file}`, import.meta.url), "utf8"));
const ontology = await data("sample-ontology.json");
const taxonomy = await data("sample-taxonomy.json");
const cases = await data("stress-cases.json");

test("ontology is valid and hash is stable", () => {
  assert.equal(lintOntology(ontology).valid, true);
  assert.equal(ontologyRef(ontology), ontologyRef(JSON.parse(JSON.stringify(ontology))));
});

test("compiler accepts grounded paths", () => {
  const compiled = compileTaxonomy(ontology, taxonomy);
  assert.equal(compiled.compilable, true);
  assert.equal(compiled.allowed_paths.length, taxonomy.allowed_paths.length);
});

test("missing edges fail closed", () => {
  const result = validateGraphPath(ontology, "Spectrometer", [{ edge_id: "governedBy", target: "Protocol" }]);
  assert.deepEqual({ valid: result.valid, reason: result.reason }, { valid: false, reason: "MISSING_EDGE" });
});

test("STRICT refuses graph-valid but unauthorized paths", () => {
  const candidate = { intent: "QUERY", entry_class: "Operator", steps: [{ edge_id: "performs", target: "Measurement" }], ambiguous: false, summary: "Partial path" };
  assert.equal(evaluateCandidate({ question: "What does the operator perform?", candidate, ontology, taxonomy }).decision, "HARD_REFUSE");
  assert.equal(evaluateCandidate({ question: "What does the operator perform?", candidate, ontology, taxonomy, mode: "PATH_VALIDITY" }).decision, "ADMIT");
});

test("governed changes are reviewed, not executed", () => {
  const candidate = { intent: "ONTOLOGY_CHANGE_REQUEST", entry_class: "Spectrometer", steps: [], ambiguous: false, summary: "change" };
  const result = evaluateCandidate({ question: "Add an edge", candidate, ontology, taxonomy });
  assert.equal(result.decision, "HUMAN_REVIEW");
  assert.equal(result.reason, "GOVERNED_CHANGE_REQUEST");
});

test("fixed stress suite passes", () => {
  const suite = runStressSuite({ cases, ontology, taxonomy });
  assert.equal(suite.failed, 0);
  assert.equal(suite.passed, cases.length);
});
