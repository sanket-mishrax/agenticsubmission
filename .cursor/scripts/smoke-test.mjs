#!/usr/bin/env node
/**
 * Headless smoke test for the Manuscript Submit Assistant extension.
 * Exercises the agentic extraction pipeline against the bundled sample manuscript.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { extractManuscriptMetadata } from '../../extension/lib/extractor.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const samplePath = join(root, 'extension/samples/sample-manuscript.tex');
const rawText = readFileSync(samplePath, 'utf8');

const parsed = {
  fileName: 'sample-manuscript.tex',
  fileType: 'latex',
  rawText,
  parsedAt: new Date().toISOString(),
};

const metadata = await extractManuscriptMetadata(parsed, { abstractWordLimit: 250 });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  metadata.title?.value?.includes('Agentic Extraction'),
  `Expected title to contain "Agentic Extraction", got: ${metadata.title?.value}`
);
assert(metadata.authors?.length >= 2, `Expected at least 2 authors, got: ${metadata.authors?.length}`);
assert(
  metadata.emails?.includes('jane.smith@stanford.edu'),
  `Expected jane.smith@stanford.edu in emails, got: ${metadata.emails?.join(', ')}`
);
assert(
  metadata.abstract?.value?.length > 100,
  'Expected abstract to be extracted with substantial content'
);
assert(
  metadata.abstract?.wordCount > 50,
  `Expected abstract with substantial content (count: ${metadata.abstract?.wordCount})`
);
assert(
  metadata.abstract?.exceedsLimit === false,
  `Sample abstract should be under the 250-word limit (count: ${metadata.abstract?.wordCount})`
);
assert(
  metadata.keywords?.value?.includes('manuscript submission'),
  `Expected keywords, got: ${metadata.keywords?.value}`
);

console.log('Smoke test passed');
console.log(`  Title: ${metadata.title.value.slice(0, 60)}...`);
console.log(`  Authors: ${metadata.authors.map((a) => a.name).join(', ')}`);
console.log(`  Emails: ${metadata.emails.join(', ')}`);
console.log(`  Abstract words: ${metadata.abstract.wordCount} (limit ${metadata.abstract.wordLimit})`);
