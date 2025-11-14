import { promises as fs } from "node:fs";
import path from "node:path";
import {
  BASE_LANGUAGE,
  CLIENT_LOCALES_DIR,
  SUPPORTED_LANGUAGES,
} from "./config.mjs";

async function readJson(file) {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function flattenMessages(obj, prefix = "") {
  const entries = [];
  for (const [key, value] of Object.entries(obj ?? {})) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      entries.push(...flattenMessages(value, nextPrefix));
    } else {
      entries.push(nextPrefix);
    }
  }
  return entries;
}

async function loadNamespaces(lang) {
  const dir = path.join(CLIENT_LOCALES_DIR, lang);
  const namespaces = new Map();

  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch (error) {
    if (error.code === "ENOENT") {
      return namespaces;
    }
    throw error;
  }

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const namespace = path.basename(file, ".json");
    const data = await readJson(path.join(dir, file));
    if (data) {
      namespaces.set(namespace, new Set(flattenMessages(data)));
    }
  }

  return namespaces;
}

function diffNamespaces(baseNamespaces, targetNamespaces, lang) {
  const issues = [];

  for (const [namespace, baseKeys] of baseNamespaces.entries()) {
    const targetKeys = targetNamespaces.get(namespace);
    if (!targetKeys) {
      issues.push({
        lang,
        namespace,
        type: "missing-namespace",
        message: `Namespace "${namespace}" missing`,
      });
      continue;
    }

    for (const key of baseKeys) {
      if (!targetKeys.has(key)) {
        issues.push({
          lang,
          namespace,
          type: "missing-key",
          message: `Missing key "${namespace}.${key}"`,
        });
      }
    }

    for (const extraKey of targetKeys) {
      if (!baseKeys.has(extraKey)) {
        issues.push({
          lang,
          namespace,
          type: "extra-key",
          message: `Extra key "${namespace}.${extraKey}"`,
        });
      }
    }
  }

  return issues;
}

async function lintLocales() {
  const baseNamespaces = await loadNamespaces(BASE_LANGUAGE);
  const baseEmpty = baseNamespaces.size === 0;
  if (baseEmpty) {
    console.warn(
      `[i18n] Base language "${BASE_LANGUAGE}" has no namespace files yet.`
    );
  }

  let issueCount = 0;

  for (const lang of SUPPORTED_LANGUAGES) {
    if (lang === BASE_LANGUAGE) continue;

    const targetNamespaces = await loadNamespaces(lang);
    if (targetNamespaces.size === 0) {
      console.warn(
        `[i18n] Language "${lang}" has no namespace files yet. Skipping diff.`
      );
      continue;
    }

    if (baseEmpty) continue;

    const issues = diffNamespaces(baseNamespaces, targetNamespaces, lang);
    if (issues.length) {
      issueCount += issues.length;
      for (const issue of issues) {
        console.error(
          `[i18n][${lang}] ${issue.type} -> ${issue.namespace}: ${issue.message}`
        );
      }
    }
  }

  if (issueCount > 0) {
    console.error(`[i18n] Lint failed with ${issueCount} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log("[i18n] Locale files are aligned ✅");
  }
}

lintLocales().catch((error) => {
  console.error("[i18n] Lint execution failed:", error);
  process.exitCode = 1;
});
