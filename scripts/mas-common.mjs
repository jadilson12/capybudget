// Shared helpers for the Mac App Store tooling (build / package / upload).
// Env vars are documented in specs/RELEASING.md (§ Mac App Store).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SRC_TAURI = resolve(ROOT, "src-tauri");

// Auto-load the build machine's MAS credentials so `npm run build|package|upload:mas`
// works with no manual `export`s. This module is imported by all three scripts, and
// imports fully evaluate before the importing script reads `process.env`, so the file
// is applied in time. It holds only identifiers and the .p8 path — the real secrets
// (keychain private keys, the .p8 itself) live elsewhere — and is machine-local, never
// in the repo. Default path ~/Documents/capy-mas/mas.env; override with CAPY_MAS_ENV.
// Values already in the environment win, so CI and one-off overrides are untouched.
function loadLocalMasEnv() {
  const envPath = process.env.CAPY_MAS_ENV ?? resolve(homedir(), "Documents/capy-mas/mas.env");
  if (!existsSync(envPath)) return;
  for (const rawLine of readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadLocalMasEnv();

export function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

export function readText(relPath) {
  try {
    return readFileSync(resolve(SRC_TAURI, relPath), "utf8");
  } catch (err) {
    fail(`couldn't read src-tauri/${relPath}: ${err.message}`);
  }
}

export function readJson(relPath) {
  try {
    return JSON.parse(readText(relPath));
  } catch (err) {
    fail(`couldn't parse src-tauri/${relPath}: ${err.message}`);
  }
}

// The .app/.pkg take their name from productName in the base tauri.conf.json —
// the MAS overlay never renames the product, so both build variants match.
function productName() {
  return readJson("tauri.conf.json").productName;
}

function masTarget() {
  return process.env.MAS_TARGET ?? "universal-apple-darwin";
}

function bundleDir() {
  return resolve(SRC_TAURI, "target", masTarget(), "release", "bundle", "macos");
}

export function appBundlePath() {
  return resolve(bundleDir(), `${productName()}.app`);
}

export function pkgPath() {
  return resolve(bundleDir(), `${productName()}.pkg`);
}

// The App Store upload counter (CFBundleVersion). Checked in so it stays
// monotonic across machines and sessions; App Store Connect rejects a reused
// build number. `build:mas` reads it (unless MAS_BUILD_NUMBER overrides);
// `upload:mas` bumps it past the number it just shipped.
const BUILD_NUMBER_FILE = resolve(SRC_TAURI, "mas-build-number.txt");

export function readBuildNumber() {
  if (!existsSync(BUILD_NUMBER_FILE)) return 1;
  const raw = readFileSync(BUILD_NUMBER_FILE, "utf8").trim();
  if (!/^[1-9]\d*$/.test(raw)) {
    fail(`src-tauri/mas-build-number.txt must be a positive integer, got "${raw}"`);
  }
  return Number.parseInt(raw, 10);
}

export function writeBuildNumber(n) {
  writeFileSync(BUILD_NUMBER_FILE, `${n}\n`);
}

// Derive the concrete MAS build inputs from the committed templates and write
// them into src-tauri/: the entitlements plist (team ID + identifier
// substituted) and the tauri overlay (build number stamped, provisioning
// profile dropped when absent so local unsigned builds still complete). Shared
// by the release build and the cargo `--features mas` test run so both compile
// against identical config. Returns the generated overlay's path plus the
// inputs callers report on.
export function writeMasArtifacts() {
  const teamId = process.env.APPLE_TEAM_ID ?? "";
  const buildNumber = process.env.MAS_BUILD_NUMBER ?? String(readBuildNumber());
  const identifier = readJson("tauri.conf.json").identifier;

  const entitlements = readText("Entitlements.mas.plist.template")
    .replaceAll("${APPLE_TEAM_ID}", () => teamId)
    .replaceAll("${APP_IDENTIFIER}", () => identifier);
  writeFileSync(resolve(SRC_TAURI, "Entitlements.mas.plist"), entitlements);

  const overlay = readJson("tauri.mas.conf.json");
  overlay.bundle.macOS.bundleVersion = buildNumber;

  const hasProvisionProfile = existsSync(resolve(SRC_TAURI, "embedded.provisionprofile"));
  if (!hasProvisionProfile) {
    delete overlay.bundle.macOS.files["embedded.provisionprofile"];
  }

  const generatedConfig = resolve(SRC_TAURI, "tauri.mas.generated.json");
  writeFileSync(generatedConfig, JSON.stringify(overlay, null, 2) + "\n");

  return { generatedConfig, identifier, buildNumber, teamId, hasProvisionProfile };
}

// CFBundleVersion baked into the built .app — the authoritative record of what
// a given bundle will report to App Store Connect.
export function readAppBuildNumber(appPath) {
  try {
    return execFileSync(
      "plutil",
      ["-extract", "CFBundleVersion", "raw", "-o", "-", resolve(appPath, "Contents/Info.plist")],
      { encoding: "utf8" },
    ).trim();
  } catch {
    return null;
  }
}
