import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexContentPath = path.join(rootDir, "content", "_index.md");
const homeDataPath = path.join(rootDir, "data", "en", "home.yaml");
const layoutPath = path.join(rootDir, "layouts", "index.html");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function getFrontMatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : "";
}

const errors = [];

const frontMatter = getFrontMatter(read(indexContentPath));
const topLevelKeys = Array.from(frontMatter.matchAll(/^([A-Za-z0-9_]+):/gm)).map((match) => match[1]);
const allowedKeys = new Set(["title", "description"]);
const unexpectedKeys = topLevelKeys.filter((key) => !allowedKeys.has(key));

if (unexpectedKeys.length > 0) {
  errors.push(`content/_index.md contains non-metadata homepage fields: ${unexpectedKeys.join(", ")}`);
}

const layout = read(layoutPath);
if (layout.includes(".Params.")) {
  errors.push("layouts/index.html still references .Params; homepage sections should come from data/en/home.yaml.");
}

const homeData = read(homeDataPath);
if (!/^sections:/m.test(homeData)) {
  errors.push("data/en/home.yaml is missing the top-level sections collection.");
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exit(1);
}

console.log("Homepage componentization check passed.");
