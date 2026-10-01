#!/usr/bin/env node
// Structural checks for the steel plugin: the rules every command and example artifact must
// follow, enforced in CI so the pipelines cannot quietly drift from their own contract.
// Dependency-free on purpose: `node scripts/check-pipelines.mjs`.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const pluginDir = join(root, 'plugins/steel');
const commandsDir = join(pluginDir, 'commands');
const examplesDir = join(root, 'examples');

const errors = [];
const fail = (file, message) => errors.push(`${relative(root, file)}: ${message}`);

/** Minimal YAML frontmatter reader — flat `key: value` pairs are all the commands use. */
function frontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return null;
  return Object.fromEntries(
    match[1]
      .split('\n')
      .filter((line) => line.includes(':'))
      .map((line) => {
        const i = line.indexOf(':');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
      }),
  );
}

// ---------- Commands ----------

const commands = readdirSync(commandsDir).filter((f) => f.endsWith('.md'));
const commandNames = new Set(commands.map((f) => f.replace(/\.md$/, '')));
const FORBIDDEN_TOOLS = [/git (commit|push|reset|checkout|stash|rebase)/, /Bash\(\*\)/, /^Bash$/];

for (const file of commands) {
  const path = join(commandsDir, file);
  const text = readFileSync(path, 'utf8');
  const meta = frontmatter(text);

  if (!meta) {
    fail(path, 'missing frontmatter');
    continue;
  }
  for (const key of ['description', 'argument-hint', 'allowed-tools']) {
    if (!meta[key]) fail(path, `frontmatter is missing "${key}"`);
  }

  const tools = (meta['allowed-tools'] ?? '').split(',').map((t) => t.trim());
  for (const tool of tools) {
    if (FORBIDDEN_TOOLS.some((pattern) => pattern.test(tool))) {
      fail(path, `allowed-tools must not pre-approve "${tool}" (stages never change git state)`);
    }
  }

  if (!text.includes('`steel:pipeline-conventions`')) {
    fail(path, 'does not load the steel:pipeline-conventions skill');
  }

  // Every /steel:<name> mentioned must exist, so "Next:" pointers never dangle.
  for (const [, name] of text.matchAll(/\/steel:([a-z0-9-]+)/g)) {
    if (!commandNames.has(name)) fail(path, `refers to /steel:${name}, which does not exist`);
  }

  // Stage numbering: "Stage: 02 of 04" must match the pipeline's command count.
  const stage = /Stage: (\d+) of (\d+)/.exec(text);
  if (stage) {
    const prefix = file.replace(/-[a-z]+\.md$/, '');
    const siblings = commands.filter((f) => f.startsWith(`${prefix}-`)).length;
    if (Number(stage[2]) !== siblings) {
      fail(path, `says "of ${stage[2]}" but the ${prefix} pipeline has ${siblings} stages`);
    }
  }
}

// ---------- Skill ----------

const skill = join(pluginDir, 'skills/pipeline-conventions/SKILL.md');
const skillMeta = frontmatter(readFileSync(skill, 'utf8'));
if (!skillMeta?.name || !skillMeta?.description) fail(skill, 'needs name and description');

// ---------- Example artifacts ----------

const HEADER_FIELDS = ['Run', 'Stage', 'Status', 'Inputs', 'Next'];
const STATUSES = new Set(['complete', 'needs-input', 'blocked']);

function* artifacts(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* artifacts(path);
    else if (/^\d\d-[a-z-]+\.md$/.test(entry)) yield path;
  }
}

let artifactCount = 0;
for (const path of artifacts(examplesDir)) {
  artifactCount++;
  const head = readFileSync(path, 'utf8').split('\n').slice(0, 12).join('\n');
  for (const field of HEADER_FIELDS) {
    if (!new RegExp(`^- ${field}: `, 'm').test(head)) fail(path, `header is missing "${field}"`);
  }
  const status = /^- Status: (\S+)/m.exec(head)?.[1];
  if (status && !STATUSES.has(status)) fail(path, `unknown status "${status}"`);
}

// ---------- Report ----------

if (errors.length > 0) {
  console.error(`✗ ${errors.length} problem(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`✓ ${commands.length} commands, 1 skill, ${artifactCount} example artifacts checked`);
