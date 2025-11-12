import { promises as fs } from "node:fs";
import path from "node:path";
import {
  CLIENT_SOURCE_DIR,
  IGNORED_DIRECTORIES,
  OUTPUT_KEY_USAGE_FILE,
  TEXT_FILE_EXTENSIONS,
} from "./config.mjs";

const KEY_PATTERN =
  /\b(?:t|translate)\(\s*["'`]([a-z0-9.-]+:[a-z0-9.-]+)["'`]/gi;

async function collectSourceFiles(dir) {
  const files = [];
  let entries = [];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return files;
    }
    throw error;
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) continue;
      const nested = await collectSourceFiles(path.join(dir, entry.name));
      files.push(...nested);
    } else {
      const ext = path.extname(entry.name);
      if (TEXT_FILE_EXTENSIONS.includes(ext)) {
        files.push(path.join(dir, entry.name));
      }
    }
  }

  return files;
}

async function extractKeys() {
  const keys = new Set();
  const files = await collectSourceFiles(CLIENT_SOURCE_DIR);

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    let match;
    while ((match = KEY_PATTERN.exec(content)) !== null) {
      keys.add(match[1]);
    }
  }

  return Array.from(keys).sort();
}

async function writeReport(keys) {
  await fs.mkdir(path.dirname(OUTPUT_KEY_USAGE_FILE), { recursive: true });
  const payload = {
    generatedAt: new Date().toISOString(),
    keyCount: keys.length,
    keys,
  };

  await fs.writeFile(
    OUTPUT_KEY_USAGE_FILE,
    JSON.stringify(payload, null, 2),
    "utf8"
  );
}

async function main() {
  const keys = await extractKeys();
  await writeReport(keys);
  console.log(
    `[i18n] Extracted ${keys.length} key${keys.length === 1 ? "" : "s"} into ${OUTPUT_KEY_USAGE_FILE}`
  );
}

main().catch((error) => {
  console.error("[i18n] Key extraction failed:", error);
  process.exitCode = 1;
});
