#!/usr/bin/env node
/**
 * AI-visibility tracker: how often does an AI assistant name or cite Greg Swierad
 * when a podcast host asks a question that does not mention him?
 *
 * Ported from the subida.ai repo (scripts/ai-visibility), with Greg's own question set.
 *
 * Same idea as the daily tracking in Admiral Media's AEO case studies, reduced to
 * one assistant we can query from code: the OpenAI Responses API with the
 * `web_search` tool, which is the closest programmatic stand-in for ChatGPT search.
 *
 *   node scripts/ai-visibility/run.mjs                 # every question, 1 sample each
 *   node scripts/ai-visibility/run.mjs --samples 3     # answers vary; more samples = steadier share
 *   node scripts/ai-visibility/run.mjs --model gpt-5.5 --only en-guest-ab,pl-guest-ab
 *
 * Writes:
 *   reports/ai-visibility/<date>-<model>.json   every answer, its citations, and whether we were named
 *   reports/ai-visibility/history.csv           one summary row per run (the trend line)
 *
 * The key is read from OPENAI_API_KEY, falling back to ~/.claude/scripts/.env.
 * Cost: roughly one web-search call per answer (~$0.01–0.03 each on a mini model).
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const QUESTIONS = path.join(ROOT, "scripts", "ai-visibility", "questions.json");
const OUT_DIR = path.join(ROOT, "reports", "ai-visibility");

// "Greg Swierad", "Grzegorz Świerad", "Gregiem Świeradem" (Polish cases) or the domain.
const BRAND = /\b(?:greg\w*|grzegorz\w*)\s+(?:\(greg\)\s+)?[sś]wierad\w*|gregswierad/i;
const OWN_DOMAIN = /(^|\.)gregswierad\.com$/i;

function parseArgs(argv) {
  const args = { model: "gpt-5.4-mini", samples: 1, concurrency: 4, only: null };
  for (let i = 0; i < argv.length; i += 2) {
    const flag = argv[i];
    const value = argv[i + 1] ?? "";
    if (flag === "--model") args.model = value;
    else if (flag === "--samples") args.samples = Math.max(1, Number(value) || 1);
    else if (flag === "--concurrency") args.concurrency = Math.max(1, Number(value) || 1);
    else if (flag === "--only") args.only = new Set(value.split(","));
    else throw new Error(`Unknown flag ${flag}`);
  }
  return args;
}

async function apiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const env = await fs.readFile(path.join(os.homedir(), ".claude", "scripts", ".env"), "utf8");
    const match = env.match(/^\s*OPENAI_API_KEY\s*=\s*["']?([^"'\s]+)/m);
    if (match) return match[1];
  } catch {
    /* fall through */
  }
  throw new Error("OPENAI_API_KEY is not set and ~/.claude/scripts/.env has none.");
}

/** One answer from the Responses API with live web search, plus its URL citations. */
async function ask(key, model, question) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, tools: [{ type: "web_search" }], input: question.q }),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  let text = "";
  const citations = [];

  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const part of item.content ?? []) {
      if (part.type !== "output_text") continue;
      text += part.text;
      for (const note of part.annotations ?? []) {
        if (note.type === "url_citation" && note.url) citations.push({ url: note.url, title: note.title ?? "" });
      }
    }
  }

  const hosts = citations.map((citation) => {
    try {
      return new URL(citation.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  });

  return {
    text,
    citations,
    named: BRAND.test(text),
    cited: hosts.some((host) => OWN_DOMAIN.test(host)),
    hosts: [...new Set(hosts.filter(Boolean))],
    usage: data.usage ?? null,
  };
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}

const pct = (part, whole) => (whole ? Math.round((1000 * part) / whole) / 10 : 0);

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const key = await apiKey();
  const { questions } = JSON.parse(await fs.readFile(QUESTIONS, "utf8"));
  const selected = questions.filter((question) => !args.only || args.only.has(question.id));

  const jobs = selected.flatMap((question) => Array.from({ length: args.samples }, (_, sample) => ({ question, sample })));
  console.log(`Asking ${args.model}: ${selected.length} questions × ${args.samples} sample(s) = ${jobs.length} answers`);

  const answers = await pool(jobs, args.concurrency, async ({ question, sample }) => {
    try {
      const result = await ask(key, args.model, question);
      process.stdout.write(result.named ? "✓" : result.cited ? "c" : "·");
      return { id: question.id, lang: question.lang, theme: question.theme, branded: Boolean(question.branded), sample, q: question.q, ...result };
    } catch (error) {
      process.stdout.write("!");
      return { id: question.id, lang: question.lang, theme: question.theme, branded: Boolean(question.branded), sample, q: question.q, error: String(error.message ?? error) };
    }
  });
  process.stdout.write("\n");

  const ok = answers.filter((answer) => !answer.error);
  const unbranded = ok.filter((answer) => !answer.branded);
  const named = unbranded.filter((answer) => answer.named).length;
  const cited = unbranded.filter((answer) => answer.cited).length;

  const byTheme = {};
  for (const answer of unbranded) {
    byTheme[answer.theme] ??= { answers: 0, named: 0 };
    byTheme[answer.theme].answers += 1;
    if (answer.named) byTheme[answer.theme].named += 1;
  }

  const hostCounts = {};
  for (const answer of unbranded) for (const host of answer.hosts) hostCounts[host] = (hostCounts[host] ?? 0) + 1;
  const topHosts = Object.entries(hostCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const date = new Date().toISOString().slice(0, 10);
  const summary = {
    date,
    model: args.model,
    answers: unbranded.length,
    errors: answers.length - ok.length,
    namedShare: pct(named, unbranded.length),
    citedShare: pct(cited, unbranded.length),
    byTheme: Object.fromEntries(Object.entries(byTheme).map(([theme, v]) => [theme, `${pct(v.named, v.answers)}% of ${v.answers}`])),
    brandedControls: ok.filter((answer) => answer.branded).map((answer) => ({ id: answer.id, named: answer.named, cited: answer.cited })),
    topCitedSites: topHosts,
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `${date}-${args.model}.json`);
  await fs.writeFile(outFile, `${JSON.stringify({ summary, answers }, null, 2)}\n`);

  const historyFile = path.join(OUT_DIR, "history.csv");
  const header = "date,model,answers,named_share_pct,cited_share_pct,guest,expert,info\n";
  const themeCell = (theme) => (byTheme[theme] ? pct(byTheme[theme].named, byTheme[theme].answers) : "");
  const row = [date, args.model, unbranded.length, summary.namedShare, summary.citedShare, themeCell("guest"), themeCell("expert"), themeCell("info")].join(",");
  let history = "";
  try {
    history = await fs.readFile(historyFile, "utf8");
  } catch {
    history = header;
  }
  await fs.writeFile(historyFile, `${history}${row}\n`);

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nSaved ${path.relative(ROOT, outFile)} and appended to ${path.relative(ROOT, historyFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
