import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { compileTaxonomy, evaluateCandidate, lintOntology, runStressSuite } from "./src/engine.js";
import { interpretQuestion } from "./src/openai.js";

const ROOT = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC = join(ROOT, "public");

async function loadEnv(path) {
  if (!existsSync(path)) return;
  const text = await readFile(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

await loadEnv(join(ROOT, ".env.local"));

const ontology = JSON.parse(await readFile(join(ROOT, "data", "sample-ontology.json"), "utf8"));
const taxonomy = JSON.parse(await readFile(join(ROOT, "data", "sample-taxonomy.json"), "utf8"));
const stressCases = JSON.parse(await readFile(join(ROOT, "data", "stress-cases.json"), "utf8"));
const compiledTaxonomy = compileTaxonomy(ontology, taxonomy);

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 1_000_000) throw new Error("REQUEST_TOO_LARGE");
  }
  return raw ? JSON.parse(raw) : {};
}

async function serveStatic(pathname, res) {
  const target = pathname === "/" ? "index.html" : pathname.slice(1);
  const safe = normalize(target).replace(/^(\.\.(\/|\\|$))+/, "");
  const path = join(PUBLIC, safe);
  if (!path.startsWith(PUBLIC) || !existsSync(path)) return false;
  const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" }[extname(path)] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": `${mime}; charset=utf-8` });
  res.end(await readFile(path));
  return true;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/bootstrap") {
      return json(res, 200, {
        ontology,
        taxonomy: compiledTaxonomy,
        lint: lintOntology(ontology),
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        api_ready: Boolean(process.env.OPENAI_API_KEY)
      });
    }

    if (req.method === "GET" && url.pathname === "/api/stress") {
      return json(res, 200, runStressSuite({ cases: stressCases, ontology, taxonomy }));
    }

    if (req.method === "POST" && url.pathname === "/api/evaluate") {
      const input = await body(req);
      if (typeof input.question !== "string" || !input.question.trim()) return json(res, 400, { error: "QUESTION_REQUIRED" });

      let interpretation;
      if (input.candidate) {
        interpretation = { candidate: input.candidate, model: "operator-supplied-fixture", response_id: null };
      } else {
        interpretation = await interpretQuestion({
          question: input.question.trim(), ontology, taxonomy,
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || "gpt-5.6"
        });
      }

      const decision = evaluateCandidate({
        question: input.question.trim(), candidate: interpretation.candidate,
        ontology, taxonomy, mode: input.mode || taxonomy.mode
      });
      return json(res, 200, { interpretation, decision });
    }

    if (req.method === "GET" && await serveStatic(url.pathname, res)) return;
    json(res, 404, { error: "NOT_FOUND" });
  } catch (error) {
    const known = new Set(["OPENAI_API_KEY_MISSING", "MODEL_REFUSAL", "INVALID_MODEL_OUTPUT", "REQUEST_TOO_LARGE"]);
    const status = error.status || (known.has(error.message) ? 422 : 500);
    json(res, status, { error: known.has(error.message) ? error.message : "REQUEST_FAILED", detail: error.message });
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, "127.0.0.1", () => {
  console.log(`MONNA Semantic Firewall Studio running at http://127.0.0.1:${port}`);
});
