import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.join(__dirname, "..", "..");
export const CLIENT_SOURCE_DIR = path.join(ROOT_DIR, "client", "src");
export const CLIENT_LOCALES_DIR = path.join(CLIENT_SOURCE_DIR, "locales");
export const SERVER_LOCALES_DIR = path.join(ROOT_DIR, "server", "src", "locales");

export const SUPPORTED_LANGUAGES = ["ko", "en"];
export const BASE_LANGUAGE = "ko";

export const TEXT_FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
export const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  "dist",
  "build",
  ".turbo",
  ".next",
  ".git",
]);

export const OUTPUT_KEY_USAGE_FILE = path.join(
  ROOT_DIR,
  "docs",
  "i18n-key-usage.json"
);

export const CLIENT_NAMESPACES = [
  "common",
  "dashboard",
  "notes",
  "finance",
  "settings",
  "system",
  "auth",
  "widgets",
];
