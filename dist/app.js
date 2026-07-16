let bootstrap;
let mode = "STRICT";
let lastDecision = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

async function getJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.detail || payload.error || "Request failed");
  return payload;
}

function renderGraph(ontology) {
  const svg = $("#graph");
  const positions = {
    Lab:[90,80], Instrument:[350,80], Centrifuge:[620,45], Spectrometer:[620,120],
    Operator:[90,310], Measurement:[350,300], Protocol:[620,300], "xsd:int":[820,45], "xsd:string":[620,205]
  };
  const center = (id) => { const [x,y] = positions[id] || [0,0]; return [x+55,y+18]; };
  const edges = ontology.edges.map((edge) => {
    const [x1,y1] = center(edge.source); const [x2,y2] = center(edge.target);
    return `<g><line class="edge-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><text class="edge-label" x="${(x1+x2)/2}" y="${(y1+y2)/2-6}" text-anchor="middle">${edge.id}</text></g>`;
  }).join("");
  const nodes = ontology.classes.map((node) => {
    const [x,y] = positions[node.id] || [0,0];
    return `<g class="graph-node ${node.kind}" transform="translate(${x} ${y})"><rect width="110" height="36"/><text x="55" y="22" text-anchor="middle">${node.label}</text></g>`;
  }).join("");
  svg.innerHTML = edges + nodes;
}

function renderBootstrap(data) {
  $("#apiStatus").textContent = data.api_ready ? `${data.model} / API READY` : "API KEY REQUIRED";
  $("#classCount").textContent = data.lint.counts.classes;
  $("#edgeCount").textContent = data.lint.counts.edges;
  $("#lintPill").textContent = data.lint.valid ? "VALID STRUCTURE" : "ISSUES FOUND";
  $("#lintPill").classList.toggle("ok", data.lint.valid);
  const checks = [
    ["Class identity", `${data.lint.counts.classes} unique declarations`],
    ["Edge endpoints", `${data.lint.counts.edges} relationships resolved`],
    ["UFO categories", `${data.lint.counts.warnings} warnings`],
    ["Compiler gate", data.taxonomy.compilable ? "policy can compile" : "blocked"]
  ];
  $("#lintResults").innerHTML = checks.map(([name,value]) => `<div class="lint-row"><b>✓</b><div>${name}<br><span>${value}</span></div></div>`).join("");
  $("#taxonomyVersion").textContent = data.taxonomy.version;
  $("#allowedCount").textContent = data.taxonomy.allowed_paths.length;
  $("#rejectedCount").textContent = data.taxonomy.rejection_ledger.length;
  $("#minDepth").textContent = data.taxonomy.minimum_depth;
  $("#allowedPaths").innerHTML = data.taxonomy.allowed_paths.map((path) => `<div class="compiled-row"><span>${path.signature}</span><b>ADMIT</b></div>`).join("");
  renderGraph(data.ontology);
}

function humanReason(code) {
  return {
    AUTHORIZED_PATH:"The proposed path exists in the graph and matches the compiled taxonomy.",
    GRAPH_PATH_VALID:"Every proposed edge exists in the authorized graph.",
    MISSING_EDGE:"The proposal depends on a relationship absent from the authorized ontology.",
    UNKNOWN_ENTRY_CLASS:"The proposal begins outside the authorized ontology.",
    UNKNOWN_TARGET_CLASS:"The proposal targets a class outside the authorized ontology.",
    PATH_NOT_AUTHORIZED:"The path is graph-valid but absent from the active strict taxonomy.",
    GOVERNED_CHANGE_REQUEST:"This request would change authority and must be reviewed by an authorized human.",
    AMBIGUOUS_INTERPRETATION:"More than one interpretation remains plausible; the gate will not guess.",
    BELOW_SEMANTIC_FLOOR:"The proposal is less specific than the active minimum depth.",
    VERSION_MISMATCH:"The ontology and taxonomy versions do not match."
  }[code] || "The request failed a deterministic policy check.";
}

function renderPath(path) {
  const parts = [`<span class="node">${path.entry_class}</span>`];
  for (const step of path.steps) parts.push(`<span class="arrow">→</span><span class="edge">${step.edge_id}</span><span class="arrow">→</span><span class="node">${step.target}</span>`);
  $("#pathView").innerHTML = parts.join("");
}

function renderDecision(payload) {
  const result = payload.decision;
  lastDecision = payload;
  const card = $("#decisionCard");
  card.className = `decision-card ${result.decision === "ADMIT" ? "admit" : result.decision === "HUMAN_REVIEW" ? "review" : "refuse"}`;
  $("#decisionSeal span").textContent = result.decision.replace("HARD_", "").replace("HUMAN_", "");
  $("#decisionTitle").textContent = result.decision.replaceAll("_", " ");
  $("#decisionReason").textContent = humanReason(result.reason);
  $("#intent").textContent = result.classified_intent;
  $("#reasonCode").textContent = result.reason;
  $("#modelUsed").textContent = payload.interpretation.model;
  $("#download").disabled = false;
  renderPath(result.classified_path);
}

async function evaluate() {
  const button = $("#evaluate");
  button.disabled = true; button.querySelector("span").textContent = "Interpreting with GPT‑5.6…";
  try {
    const payload = await getJson("/api/evaluate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ question:$("#question").value, mode }) });
    renderDecision(payload);
  } catch (error) {
    $("#decisionTitle").textContent = "FAIL CLOSED";
    $("#decisionReason").textContent = error.message;
    $("#decisionCard").className = "decision-card refuse";
    $("#decisionSeal span").textContent = "REFUSE";
  } finally {
    button.disabled = false; button.querySelector("span").textContent = "Evaluate request";
  }
}

async function runStress() {
  const data = await getJson("/api/stress");
  $("#stressScore").textContent = `${Math.round(data.passed / data.total * 100)}%`;
  $("#stressResults").innerHTML = data.results.map((item) => `<div class="test-card"><i>${item.passed ? "✓" : "!"}</i><div><h4>${item.label}</h4><p>${item.reason}</p></div><b>${item.actual.replace("HARD_", "")}</b></div>`).join("");
}

$$('.tab').forEach((button) => button.addEventListener("click", () => {
  $$('.tab').forEach((item) => item.classList.toggle("active", item === button));
  $$('.panel').forEach((panel) => panel.classList.toggle("active", panel.id === button.dataset.target));
}));
$$('.mode').forEach((button) => button.addEventListener("click", () => {
  mode = button.dataset.mode; $$('.mode').forEach((item) => item.classList.toggle("active", item === button));
}));
$$('[data-question]').forEach((button) => button.addEventListener("click", () => { $("#question").value = button.dataset.question; }));
$("#evaluate").addEventListener("click", evaluate);
$("#runStress").addEventListener("click", runStress);
$("#download").addEventListener("click", () => {
  if (!lastDecision) return;
  const blob = new Blob([JSON.stringify(lastDecision, null, 2)], {type:"application/json"});
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "monna-firewall-audit.json"; link.click(); URL.revokeObjectURL(link.href);
});

bootstrap = await getJson("/api/bootstrap");
renderBootstrap(bootstrap);
