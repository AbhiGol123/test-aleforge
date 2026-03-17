import fs from "node:fs";
import path from "node:path";
import {execSync} from "node:child_process";

const OUT_DIR = "src/i18n";
const OUT_EN = path.join(OUT_DIR, "site.en.json");
const OUT_ES = path.join(OUT_DIR, "site.es.json");
const OUT_NL = path.join(OUT_DIR, "site.nl.json");
const OUT_DE = path.join(OUT_DIR, "site.de.json");
const OUT_ALL_EN = path.join(OUT_DIR, "all-html-texts.en.json");
const OUT_ALL_ES = path.join(OUT_DIR, "all-html-texts.es.json");
const OUT_ALL_NL = path.join(OUT_DIR, "all-html-texts.nl.json");
const OUT_ALL_DE = path.join(OUT_DIR, "all-html-texts.de.json");

const KEY_OVERRIDES = {
  navigationComponent: {
    "Browse our full game server list. Find the perfect server for your next world.": "dropdownTitle",
    "Browse our full game server list.": "dropdownTitle",
    "View All": "dropdownViewAll"
  }
};

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "by",
  "at",
  "from",
  "is",
  "are",
  "be",
  "as",
  "this",
  "that",
  "your",
  "you",
  "our",
  "we"
]);

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
]);

function cleanText(s) {
  return String(s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeJs(text) {
  return (
    /[{}]/.test(text) ||
    /=>/.test(text) ||
    /^[a-z]+(?:_[a-z]+)+$/.test(text) ||
    /\)\s*:\s*/.test(text) ||
    /\?\s*\(/.test(text) ||
    /\b[a-zA-Z_]+\.[a-zA-Z_]+\b/.test(text) ||
    /\b(const|let|var|return|if|else|for|while|function|import|export|await|async)\b/.test(text) ||
    /\b\w+\s*\.\s*(map|filter|reduce|forEach|find|sort)\s*\(/.test(text) ||
    /\$\{[^}]*\}/.test(text)
  );
}

function isUsefulText(text) {
  if (!text) return false;
  if (/^[{}()[\];:.,/\\|`~!@#%^&*+=<>?_-]+$/.test(text)) return false;
  if (looksLikeJs(text)) return false;
  return /[A-Za-z]/.test(text);
}

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

function textToKey(componentName, text) {
  const compOverrides = KEY_OVERRIDES[componentName] || {};
  if (compOverrides[text]) return compOverrides[text];

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w))
    .slice(0, 5);

  if (!words.length) return "label";
  if (words.length === 1) return words[0];
  return words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
}

function stripNonHtml(source) {
  return source
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function extractHtmlTexts(source) {
  const html = stripNonHtml(source);
  const stack = [];
  const texts = [];
  const seen = new Set();

  // Fallback capture for plain text directly inside a tag pair.
  const simplePairRe = /<([a-zA-Z][\w:-]*)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let pair;
  while ((pair = simplePairRe.exec(html)) !== null) {
    const tag = pair[1].toLowerCase();
    const inner = cleanText(pair[2]);
    if (!inner || /[<{}`]/.test(inner)) continue;
    if (!isUsefulText(inner)) continue;
    const sig = `${tag}|${inner}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    texts.push({tag, text: inner});
  }

  const tokenRe = /<[^>]+>|[^<]+/g;
  let match;

  while ((match = tokenRe.exec(html)) !== null) {
    const token = match[0];

    if (token.startsWith("<")) {
      if (/^<\//.test(token)) {
        const close = token.match(/^<\/\s*([a-zA-Z][\w:-]*)/);
        const tag = close ? close[1].toLowerCase() : null;
        if (!tag) continue;
        while (stack.length) {
          const popped = stack.pop();
          if (popped === tag) break;
        }
        continue;
      }

      if (/^<!/.test(token) || /^<\?/.test(token)) continue;
      const open = token.match(/^<\s*([a-zA-Z][\w:-]*)/);
      if (!open) continue;
      const tag = open[1].toLowerCase();
      const selfClosing = /\/>\s*$/.test(token) || VOID_TAGS.has(tag);
      if (!selfClosing) stack.push(tag);
      continue;
    }

    const text = cleanText(token);
    if (!isUsefulText(text)) continue;
    const tag = stack[stack.length - 1];
    if (!tag) continue;
    const sig = `${tag}|${text}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    texts.push({tag, text});
  }

  return texts;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, {recursive: true});
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

const astroFiles = execSync("rg --files src -g '*.astro'", {encoding: "utf8"})
  .trim()
  .split("\n")
  .filter(Boolean);

const usedNames = new Set();
const en = {};

for (const rel of astroFiles) {
  const source = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
  const componentName = componentNameFromPath(rel, usedNames);
  usedNames.add(componentName);

  const entries = extractHtmlTexts(source);
  const compDict = {};
  const usedKeys = new Set();

  for (const entry of entries) {
    let key = textToKey(componentName, entry.text);
    if (usedKeys.has(key)) {
      let n = 2;
      while (usedKeys.has(`${key}${n}`)) n++;
      key = `${key}${n}`;
    }
    usedKeys.add(key);
    compDict[key] = entry.text;
  }

  if (componentName === "navigationComponent" && compDict.dropdownTitle) {
    compDict.dropdownTitle =
      "Browse our full game server list. Find the perfect server for your next world.";
  }

  en[componentName] = compDict;
}

ensureDir(OUT_DIR);
writeJson(OUT_EN, en);
writeJson(OUT_ES, en);
writeJson(OUT_NL, en);
writeJson(OUT_DE, en);
writeJson(OUT_ALL_EN, en);
writeJson(OUT_ALL_ES, en);
writeJson(OUT_ALL_NL, en);
writeJson(OUT_ALL_DE, en);

console.log(
  `Generated ${OUT_EN}, ${OUT_ES}, ${OUT_NL}, ${OUT_DE}, ${OUT_ALL_EN}, ${OUT_ALL_ES}, ${OUT_ALL_NL}, ${OUT_ALL_DE}`
);
console.log(`Components: ${Object.keys(en).length}`);
