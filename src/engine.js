import { createHash } from "node:crypto";

const REVIEW_INTENTS = new Set([
  "POLICY_CHANGE_REQUEST",
  "ONTOLOGY_CHANGE_REQUEST",
  "OVERRIDE_REQUEST"
]);

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function ontologyRef(ontology) {
  return `sha256:${createHash("sha256").update(stableStringify(ontology)).digest("hex")}`;
}

export function lintOntology(ontology) {
  const issues = [];
  const allowedKinds = new Set(["object", "role", "event", "normative_description", "datatype"]);
  const classes = Array.isArray(ontology?.classes) ? ontology.classes : [];
  const edges = Array.isArray(ontology?.edges) ? ontology.edges : [];
  const classIds = new Set();

  if (!ontology?.name || !ontology?.version) {
    issues.push({ severity: "error", code: "MISSING_IDENTITY", message: "Ontology name and version are required." });
  }
  for (const item of classes) {
    if (!item.id) {
      issues.push({ severity: "error", code: "CLASS_ID_MISSING", message: "Every class needs an id." });
      continue;
    }
    if (classIds.has(item.id)) {
      issues.push({ severity: "error", code: "DUPLICATE_CLASS", message: `Duplicate class: ${item.id}` });
    }
    classIds.add(item.id);
    if (!allowedKinds.has(item.kind)) {
      issues.push({ severity: "warning", code: "UNKNOWN_UFO_KIND", message: `${item.id} has an unsupported category: ${item.kind}` });
    }
  }

  const signatures = new Set();
  for (const edge of edges) {
    const signature = `${edge.source}|${edge.id}|${edge.target}`;
    if (!edge.id || !classIds.has(edge.source) || !classIds.has(edge.target)) {
      issues.push({ severity: "error", code: "DANGLING_EDGE", message: `Edge ${edge.id || "(unnamed)"} has a missing endpoint.` });
    }
    if (signatures.has(signature)) {
      issues.push({ severity: "warning", code: "DUPLICATE_EDGE", message: `Duplicate edge signature: ${signature}` });
    }
    signatures.add(signature);
    if (edge.relation_kind === "participation") {
      const source = classes.find((item) => item.id === edge.source);
      const target = classes.find((item) => item.id === edge.target);
      if (source && target && source.kind !== "event" && target.kind !== "event") {
        issues.push({ severity: "warning", code: "PARTICIPATION_WITHOUT_EVENT", message: `${edge.id} is participation but neither endpoint is an event.` });
      }
    }
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    counts: { classes: classes.length, edges: edges.length, errors: issues.filter((issue) => issue.severity === "error").length, warnings: issues.filter((issue) => issue.severity === "warning").length },
    issues
  };
}

export function pathSignature(entryClass, steps = []) {
  return `${entryClass}::${steps.map((step) => `${step.edge_id}>${step.target}`).join("/")}`;
}

export function compileTaxonomy(ontology, taxonomy) {
  const lint = lintOntology(ontology);
  const rejectionLedger = [];
  const seen = new Set();
  const allowedPaths = [];

  for (const path of taxonomy.allowed_paths || []) {
    const checked = validateGraphPath(ontology, path.entry_class, path.steps);
    const signature = pathSignature(path.entry_class, path.steps);
    if (!checked.valid) {
      rejectionLedger.push({ id: path.id, reason: checked.reason, signature });
    } else if (seen.has(signature)) {
      rejectionLedger.push({ id: path.id, reason: "DUPLICATE_SIGNATURE", signature });
    } else {
      seen.add(signature);
      allowedPaths.push({ ...path, signature });
    }
  }

  return {
    ...taxonomy,
    ontology_ref: ontologyRef(ontology),
    allowed_paths: allowedPaths,
    rejection_ledger: rejectionLedger,
    compilable: lint.valid && rejectionLedger.every((item) => item.reason === "DUPLICATE_SIGNATURE")
  };
}

export function validateGraphPath(ontology, entryClass, steps = []) {
  const classes = new Set((ontology.classes || []).map((item) => item.id));
  if (!classes.has(entryClass)) return { valid: false, reason: "UNKNOWN_ENTRY_CLASS", failed_at: 0 };
  let current = entryClass;
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    if (!classes.has(step.target)) return { valid: false, reason: "UNKNOWN_TARGET_CLASS", failed_at: index };
    const match = (ontology.edges || []).find((edge) => edge.source === current && edge.id === step.edge_id && edge.target === step.target);
    if (!match) {
      return { valid: false, reason: "MISSING_EDGE", failed_at: index, expected_source: current, proposed_edge: step.edge_id, proposed_target: step.target };
    }
    current = step.target;
  }
  return { valid: true, reason: "GRAPH_PATH_VALID", terminal: current };
}

function decisionBase({ question, candidate, ontology, taxonomy, mode }) {
  return {
    question,
    classified_intent: candidate.intent,
    classified_path: {
      entry_class: candidate.entry_class,
      steps: candidate.steps,
      depth: candidate.steps.length,
      target: candidate.steps.at(-1)?.target || candidate.entry_class
    },
    provenance: {
      model_output: "MODEL_PROPOSAL",
      ontology_edges: "AUTHORITATIVE",
      taxonomy_policy: "AUTHORITATIVE"
    },
    mode,
    ontology_ref: ontologyRef(ontology),
    taxonomy_version: taxonomy.version,
    timestamp: new Date().toISOString()
  };
}

export function evaluateCandidate({ question, candidate, ontology, taxonomy, mode = taxonomy.mode || "STRICT" }) {
  const base = decisionBase({ question, candidate, ontology, taxonomy, mode });
  const compiled = compileTaxonomy(ontology, taxonomy);

  if (!compiled.compilable) return { ...base, decision: "HARD_REFUSE", reason: "POLICY_NOT_COMPILABLE", matched_archetype: null };
  if (taxonomy.ontology_version !== ontology.version) return { ...base, decision: "HARD_REFUSE", reason: "VERSION_MISMATCH", matched_archetype: null };
  if (REVIEW_INTENTS.has(candidate.intent)) return { ...base, decision: "HUMAN_REVIEW", reason: "GOVERNED_CHANGE_REQUEST", matched_archetype: null };
  if (candidate.ambiguous) return { ...base, decision: "HUMAN_REVIEW", reason: "AMBIGUOUS_INTERPRETATION", matched_archetype: null };

  const graphCheck = validateGraphPath(ontology, candidate.entry_class, candidate.steps);
  if (!graphCheck.valid) return { ...base, decision: "HARD_REFUSE", reason: graphCheck.reason, graph_check: graphCheck, matched_archetype: null };
  if (candidate.steps.length < (taxonomy.minimum_depth || 0)) return { ...base, decision: "HUMAN_REVIEW", reason: "BELOW_SEMANTIC_FLOOR", matched_archetype: null };

  const signature = pathSignature(candidate.entry_class, candidate.steps);
  const match = compiled.allowed_paths.find((path) => path.signature === signature);
  if (mode === "STRICT" && !match) return { ...base, decision: "HARD_REFUSE", reason: "PATH_NOT_AUTHORIZED", matched_archetype: null };

  return {
    ...base,
    decision: "ADMIT",
    reason: mode === "STRICT" ? "AUTHORIZED_PATH" : "GRAPH_PATH_VALID",
    matched_archetype: match?.id || null,
    graph_check: graphCheck
  };
}

export function runStressSuite({ cases, ontology, taxonomy }) {
  const results = cases.map((testCase) => {
    const result = evaluateCandidate({ question: testCase.question, candidate: testCase.candidate, ontology, taxonomy });
    return { id: testCase.id, label: testCase.label, expected: testCase.expected, actual: result.decision, reason: result.reason, passed: result.decision === testCase.expected };
  });
  return { total: results.length, passed: results.filter((item) => item.passed).length, failed: results.filter((item) => !item.passed).length, results };
}
