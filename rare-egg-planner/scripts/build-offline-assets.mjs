import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const projectRoot = process.cwd();
const cssSourceDirectory = path.join(projectRoot, "styles", "site");
const cssSourceFiles = [
  "base.css",
  "planner.css",
  "roadmap.css",
  "catalog.css",
  "rules.css",
  "responsive.css",
];
const cssOutputPaths = [
  path.join(projectRoot, "app", "globals.css"),
  path.join(projectRoot, "offline", "assets", "style.css"),
];
const updaterSourceDirectory = path.join(projectRoot, "scripts", "updater");
const updaterSourceFiles = [
  "00-runtime.ps1",
  "10-wiki-source.ps1",
  "20-egg-source.ps1",
  "30-database-builder.ps1",
  "40-install.ps1",
];
const updaterOutputPaths = [
  path.join(projectRoot, "scripts", "update-pet-database.ps1"),
  path.join(projectRoot, "offline", "tools", "update-pet-database.ps1"),
];
const plannerSourcePath = path.join(projectRoot, "app", "planner-core.ts");
const plannerOutputPath = path.join(projectRoot, "offline", "assets", "planner-core.js");
const source = await readFile(plannerSourcePath, "utf8");
const result = ts.transpileModule(source, {
  fileName: plannerSourcePath,
  reportDiagnostics: true,
  compilerOptions: {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    strict: true,
  },
});

const errors = (result.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
if (errors.length) {
  const host = { getCanonicalFileName: (fileName) => fileName, getCurrentDirectory: () => projectRoot, getNewLine: () => "\n" };
  throw new Error(ts.formatDiagnostics(errors, host));
}

const banner = "/* Generated from app/planner-core.ts. Run npm run build:offline; do not edit by hand. */";
const compiled = result.outputText.replace(/^"use strict";\r?\n/, "");
const browserBundle = `${banner}\nwindow.ROCO_PLANNER = (() => {\n  const exports = {};\n${compiled}\n  return exports;\n})();\n`;

const cssParts = await Promise.all(
  cssSourceFiles.map(async (fileName) => {
    const content = (await readFile(path.join(cssSourceDirectory, fileName), "utf8")).trim();
    return `/* ${fileName} */\n${content}`;
  }),
);
const cssBundle = `/* Generated from styles/site/*.css. Run npm run build:offline; do not edit by hand. */\n${cssParts.join("\n\n")}\n`;

const updaterParts = await Promise.all(
  updaterSourceFiles.map(async (fileName) => {
    const content = (await readFile(path.join(updaterSourceDirectory, fileName), "utf8")).trim();
    return `# Source module: ${fileName}\n${content}`;
  }),
);
// Windows PowerShell 5.1 needs a BOM to decode the updater's Chinese prompts reliably.
const updaterBundle = `\uFEFF# Generated from scripts/updater/*.ps1. Run npm run build:offline; do not edit by hand.\n${updaterParts.join("\n\n")}\n`;

await Promise.all([
  writeFile(plannerOutputPath, browserBundle, "utf8"),
  ...cssOutputPaths.map((outputPath) => writeFile(outputPath, cssBundle, "utf8")),
  ...updaterOutputPaths.map((outputPath) => writeFile(outputPath, updaterBundle, "utf8")),
]);
