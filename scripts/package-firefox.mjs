#!/usr/bin/env node
/**
 * Cross-platform Firefox .xpi packager.
 * Usage: node scripts/package-firefox.mjs
 */

import { readFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const EXT_DIR = join(ROOT, 'extension');
const OUT_DIR = join(ROOT, 'dist');

function main() {
  const manifestPath = join(EXT_DIR, 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error('Error: extension/manifest.json not found.');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const version = manifest.version || '0.0.0';
  const xpiName = `manuscript-submit-assistant-${version}.xpi`;
  const outPath = join(OUT_DIR, xpiName);

  mkdirSync(OUT_DIR, { recursive: true });
  if (existsSync(outPath)) rmSync(outPath);

  try {
    execSync(
      `zip -r "${outPath}" . -x "*.DS_Store" -x "*__MACOSX*" -x "*.git*" -x "*~"`,
      { cwd: EXT_DIR, stdio: 'inherit' }
    );
  } catch {
    console.error('Error: `zip` command not found. Install zip or run: bash scripts/package-firefox.sh');
    process.exit(1);
  }

  console.log(`\nCreated: ${outPath}`);
  console.log('\nInstall in Firefox:');
  console.log('  1. Open about:addons');
  console.log('  2. Gear icon → Install Add-on From File…');
  console.log(`  3. Select ${outPath}`);
  console.log('\nNote: unsigned installs may require xpinstall.signatures.required = false in about:config');
}

main();
