import fs from "node:fs";
import path from "node:path";
import {execSync} from "node:child_process";

const i18n = JSON.parse(fs.readFileSync("src/i18n/site.en.json", "utf8"));

function pascalCase(parts) {
  return parts
    .filter(Boolean)
    .map((x) => x.replace(/[^a-zA-Z0-9]+/g, " "))
    .flatMap((x) => x.split(/\s+/).filter(Boolean))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
}

function camelCase(parts) {
  const pc = pascalCase(parts);
  return pc ? pc.charAt(0).toLowerCase() + pc.slice(1) : "";
}

function componentNameFromPath(relPath, usedNames) {
  const parts = relPath.split("/").filter(Boolean);
  const file = parts[parts.length - 1].replace(/\.astro$/i, "");
  const parent = parts[parts.length - 2] || "";
  const section = parts[1] || "";

  let name = "";
  if (section === "components") {
    name = `${camelCase([file]) || "component"}Component`;
  } else if (section === "pages") {
    name = file === "index" ? `${camelCase([parent || "home"])}Page` : `${camelCase([file])}Page`;
  } else if (section === "layouts") {
    name = `${camelCase([file]) || "layout"}Layout`;
  } else {
    name = `${camelCase([file || parent || "entry"])}Entry`;
  }

  if (!usedNames.has(name)) return name;

  const scoped = `${camelCase([parent, file || "entry"])}${section === "pages" ? "Page" : "Component"}`;
  if (!usedNames.has(scoped)) return scoped;

  let n = 2;
  while (usedNames.has(`${name}${n}`)) n++;
  return `${name}${n}`;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

const usedNames = new Set();
const astroFiles = execSync("rg --files src -g '*.astro'", {encoding: "utf8"})
  .trim()
  .split("\n")
  .filter(Boolean);

let filesChanged = 0;
let totalReplacements = 0;

for (const rel of astroFiles) {
  const comp = componentNameFromPath(rel, usedNames);
  usedNames.add(comp);

  const dict = i18n[comp];
  if (!dict || !Object.keys(dict).length) continue;

  const textToKey = new Map();
  for (const [key, value] of Object.entries(dict)) {
    const t = normalizeText(value);
    if (t) textToKey.set(t, key);
  }

  let source = fs.readFileSync(rel, "utf8");
  let changedInFile = 0;

  // Only target simple static text nodes with no nested tags/expressions.
  const re = /<([a-zA-Z][\w:-]*)([^>]*)>([^<>{]+)<\/\1>/g;
  source = source.replace(re, (full, tag, attrs, inner) => {
    if (/\bdata-i18n\s*=/.test(attrs)) return full;
    if (/{|}/.test(inner)) return full;
    const normalized = normalizeText(inner);
    if (!normalized) return full;
    const key = textToKey.get(normalized);
    if (!key) return full;

    changedInFile += 1;
    const nextAttrs = `${attrs} data-i18n="${comp}.${key}"`;
    return `<${tag}${nextAttrs}>${inner}</${tag}>`;
  });

  if (changedInFile > 0) {
    fs.writeFileSync(path.resolve(rel), source);
    filesChanged += 1;
    totalReplacements += changedInFile;
  }
}

console.log(`files_changed=${filesChanged}`);
console.log(`replacements=${totalReplacements}`);
