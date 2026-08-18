/**
 * Popup UI controller.
 */

import { parseManuscriptFile } from '../lib/parser.js';
import { extractManuscriptMetadata } from '../lib/extractor.js';
import { saveManuscriptData, getSettings } from '../lib/storage.js';
import { generateShorteningOptions } from '../lib/abstract.js';
import { getJournalList } from '../lib/latex-formatter.js';
import { getAllJournals, buildSubmissionPackage } from '../lib/octree.js';

let currentData = null;
let selectedShortening = null;

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
  });
});

document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');

uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', async (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) await processFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', async () => {
  if (fileInput.files.length > 0) await processFile(fileInput.files[0]);
});

async function processFile(file) {
  const status = document.getElementById('upload-status');
  status.className = 'status-msg info';
  status.textContent = 'Parsing manuscript with agentic extractor...';
  status.classList.remove('hidden');

  try {
    const parsed = await parseManuscriptFile(file);
    const settings = await getSettings();
    const metadata = await extractManuscriptMetadata(parsed, settings);

    if (metadata.abstract?.exceedsLimit) {
      metadata.shorteningOptions = generateShorteningOptions(
        metadata.abstract.value,
        settings.abstractWordLimit
      );
    }

    if (parsed.fileType === 'latex') {
      metadata.rawLatex = parsed.rawText;
    }

    await saveManuscriptData(metadata);
    currentData = metadata;

    status.className = 'status-msg success';
    status.textContent = 'Manuscript parsed successfully!';

    document.getElementById('file-info').classList.remove('hidden');
    document.getElementById('file-info').innerHTML = `
      <strong>${escapeHtml(file.name)}</strong><br>
      Type: ${currentData.fileType} · Extracted: ${new Date(currentData.extractedAt).toLocaleTimeString()}
    `;

    renderExtractTab();
    await renderAbstractTab();
    await renderLatexTab();
    renderSubmitTab();
    document.querySelector('[data-tab="extract"]').click();
  } catch (err) {
    status.className = 'status-msg error';
    status.textContent = `Error: ${err.message}`;
  }
}

function renderExtractTab() {
  if (!currentData) return;

  document.getElementById('extract-empty').classList.add('hidden');
  document.getElementById('extract-results').classList.remove('hidden');

  document.getElementById('agent-passes').innerHTML = (currentData.agentPasses || []).map(p =>
    `<span class="pass-badge ${p.completed ? '' : 'failed'}">${p.pass}: ${p.description}</span>`
  ).join('');

  document.getElementById('field-title').value = currentData.title?.value || '';
  document.getElementById('title-confidence').textContent =
    currentData.title?.confidence ? `(${(currentData.title.confidence * 100).toFixed(0)}% confidence)` : '';

  document.getElementById('field-authors').innerHTML = (currentData.authors || []).map(a =>
    `<span class="tag">${escapeHtml(a.name)}</span>`
  ).join('');

  document.getElementById('field-affiliations').innerHTML = (currentData.affiliations || []).map(a =>
    `<span class="tag affiliation">${escapeHtml(a.value)}</span>`
  ).join('');

  document.getElementById('field-emails').innerHTML = (currentData.emails || []).map(e =>
    `<span class="tag email">${escapeHtml(e)}</span>`
  ).join('');

  document.getElementById('field-keywords').value = currentData.keywords?.value || '';
  document.getElementById('field-abstract').value = currentData.abstract?.value || '';

  const wc = currentData.abstract?.wordCount || 0;
  const limit = currentData.abstract?.wordLimit || 250;
  const wcEl = document.getElementById('abstract-word-count');
  wcEl.textContent = `(${wc}/${limit} words)`;
  wcEl.className = `word-count ${wc > limit ? 'over-limit' : 'ok'}`;
}

async function renderAbstractTab() {
  if (!currentData?.abstract?.value) return;

  document.getElementById('abstract-empty').classList.add('hidden');
  document.getElementById('abstract-tools').classList.remove('hidden');

  const wc = currentData.abstract.wordCount;
  const limit = currentData.abstract.wordLimit || 250;

  document.getElementById('abstract-stats').innerHTML = `
    <strong>Word count:</strong> ${wc} / ${limit} words
    ${currentData.abstract.shortenedBy ? `<br><em>Shortened using: ${currentData.abstract.shortenedBy}</em>` : ''}
  `;

  const warning = document.getElementById('abstract-warning');
  if (currentData.abstract.exceedsLimit) {
    warning.classList.remove('hidden');
    document.getElementById('abstract-over-by').textContent =
      `Your abstract is ${wc - limit} words over the limit. Choose a shortening option below.`;
  } else {
    warning.classList.add('hidden');
  }

  const options = currentData.shorteningOptions ||
    generateShorteningOptions(currentData.abstract.value, limit);

  const optionsEl = document.getElementById('shortening-options');
  if (!options.needsShortening) {
    optionsEl.innerHTML = '<p style="color:#1a7f37;font-size:12px;">✓ Abstract is within the word limit.</p>';
    document.getElementById('apply-shortening-btn').disabled = true;
  } else {
    optionsEl.innerHTML = options.options.map(opt => `
      <div class="option-card" data-id="${opt.id}">
        <h4>${escapeHtml(opt.label)}</h4>
        <div class="meta">${opt.wordCount} words · ${escapeHtml(opt.description)}</div>
        <div class="preview">${escapeHtml(opt.text.slice(0, 200))}...</div>
      </div>
    `).join('');

    optionsEl.querySelectorAll('.option-card').forEach(card => {
      card.addEventListener('click', () => {
        optionsEl.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedShortening = card.dataset.id;
        document.getElementById('apply-shortening-btn').disabled = false;
      });
    });
  }

  const settings = await getSettings();
  const llmSection = document.getElementById('llm-shorten-section');
  if (settings.apiProvider !== 'none' && settings.apiKey) {
    llmSection.classList.remove('hidden');
  } else {
    llmSection.classList.add('hidden');
  }
}

async function renderSubmitTab() {
  if (!currentData) {
    document.getElementById('submit-empty').classList.remove('hidden');
    document.getElementById('submit-tools').classList.add('hidden');
    return;
  }

  document.getElementById('submit-empty').classList.add('hidden');
  document.getElementById('submit-tools').classList.remove('hidden');

  const suggestions = currentData.suggestedJournals || [];
  const select = document.getElementById('target-journal-select');
  const allJournals = getAllJournals();

  // Populate select with suggested journals first, then all others
  const suggestedIds = new Set(suggestions.map(s => s.id));
  const options = [
    ...suggestions.map(s => ({ id: s.id, name: s.name, suggested: true })),
    ...allJournals.filter(j => !suggestedIds.has(j.id)).map(j => ({ id: j.id, name: j.name, suggested: false }))
  ];

  select.innerHTML = options.map(o =>
    `<option value="${o.id}">${escapeHtml(o.name)}${o.suggested ? ' ★' : ''}</option>`
  ).join('');

  const summary = document.getElementById('submit-journal-summary');
  if (suggestions.length > 0) {
    summary.textContent = `Found ${suggestions.length} relevant journal(s) based on your manuscript content.`;
  } else {
    summary.textContent = 'No strong journal matches found. Select a target journal manually.';
  }

  renderJournalSuggestions(suggestions);
  renderJournalFieldStatus(select.value);

  select.onchange = () => renderJournalFieldStatus(select.value);
}

function renderJournalSuggestions(suggestions) {
  const el = document.getElementById('journal-suggestions');
  if (suggestions.length === 0) {
    el.innerHTML = '<p class="hint">Upload a manuscript with keywords/abstract to get journal suggestions.</p>';
    return;
  }

  el.innerHTML = '<h3>Suggested Journals</h3>' + suggestions.map(s => `
    <div class="journal-card" data-id="${s.id}">
      <h4>${escapeHtml(s.name)} <span class="score">${(s.score * 100).toFixed(0)}% match</span></h4>
      <div class="meta">${escapeHtml(s.publisher)} · ${escapeHtml(s.submissionPlatform)} · Abstract limit: ${s.abstractWordLimit} words</div>
      <div class="reasons">${s.reasons.slice(0, 2).map(r => escapeHtml(r)).join(' · ')}</div>
      <span class="ready-badge ${s.readyToSubmit ? 'ready' : 'incomplete'}">
        ${s.readyToSubmit ? '✓ Ready to submit' : `Missing: ${s.missingFields.join(', ')}`}
      </span>
    </div>
  `).join('');

  el.querySelectorAll('.journal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('target-journal-select').value = card.dataset.id;
      renderJournalFieldStatus(card.dataset.id);
      el.querySelectorAll('.journal-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

function renderJournalFieldStatus(journalId) {
  const pkg = buildSubmissionPackage(currentData, journalId);
  const el = document.getElementById('journal-field-status');
  if (!pkg) {
    el.innerHTML = '';
    return;
  }

  const { submissionFields, journal } = pkg;
  const abstractNote = submissionFields.abstractOk
    ? `${submissionFields.abstractWordCount}/${journal.abstractWordLimit} words`
    : `${submissionFields.abstractWordCount}/${journal.abstractWordLimit} words (over limit!)`;

  el.innerHTML = `
    <strong>Submission fields for ${escapeHtml(journal.name)}</strong>
    <p class="hint" style="margin:6px 0">Abstract: ${abstractNote}</p>
    ${Object.entries(submissionFields.fields).map(([name, f]) => `
      <div class="field-row">
        <span class="field-name">${escapeHtml(name)}${f.required ? ' *' : ''}</span>
        <span class="field-status ${f.filled ? 'filled' : (f.required ? 'missing' : 'optional')}">
          ${f.filled ? '✓ filled' : (f.required ? '✗ missing' : 'optional')}
        </span>
      </div>
    `).join('')}
  `;
}

document.getElementById('open-submission-btn').addEventListener('click', () => {
  const journalId = document.getElementById('target-journal-select').value;
  const pkg = buildSubmissionPackage(currentData, journalId);
  if (pkg?.submissionUrl) {
    chrome.tabs.create({ url: pkg.submissionUrl });
  }
});

async function renderLatexTab() {
  if (!currentData?.rawLatex) return;

  document.getElementById('latex-empty').classList.add('hidden');
  document.getElementById('latex-tools').classList.remove('hidden');

  const journals = getJournalList();
  const select = document.getElementById('journal-select');
  select.innerHTML = journals.map(j =>
    `<option value="${j.key}">${escapeHtml(j.name)}</option>`
  ).join('');
}

document.getElementById('save-fields-btn').addEventListener('click', async () => {
  for (const [field, id] of [['title', 'field-title'], ['abstract', 'field-abstract'], ['keywords', 'field-keywords']]) {
    await chrome.runtime.sendMessage({
      action: 'updateField',
      field,
      value: document.getElementById(id).value
    });
  }
  const res = await chrome.runtime.sendMessage({ action: 'getManuscriptData' });
  currentData = res.data;
  showStatus('extract-results', 'Changes saved!', 'success');
});

document.getElementById('copy-all-btn').addEventListener('click', () => {
  if (!currentData) return;
  const text = [
    `Title: ${currentData.title?.value || ''}`,
    `Authors: ${(currentData.authors || []).map(a => a.name).join(', ')}`,
    `Affiliations: ${(currentData.affiliations || []).map(a => a.value).join('; ')}`,
    `Emails: ${(currentData.emails || []).join(', ')}`,
    `Keywords: ${currentData.keywords?.value || ''}`,
    `Abstract: ${currentData.abstract?.value || ''}`
  ].join('\n\n');
  navigator.clipboard.writeText(text);
  showStatus('extract-results', 'Copied to clipboard!', 'success');
});

document.getElementById('apply-shortening-btn').addEventListener('click', async () => {
  if (!selectedShortening) return;
  try {
    const res = await chrome.runtime.sendMessage({ action: 'applyShortening', strategy: selectedShortening });
    if (res.error) throw new Error(res.error);
    currentData = res.data;
    renderExtractTab();
    await renderAbstractTab();
    showStatus('abstract-tools', 'Abstract shortened successfully!', 'success');
  } catch (err) {
    showStatus('abstract-tools', err.message, 'error');
  }
});

document.getElementById('llm-shorten-btn').addEventListener('click', async () => {
  try {
    const res = await chrome.runtime.sendMessage({ action: 'applyShortening', strategy: 'llm' });
    if (res.error) throw new Error(res.error);
    currentData = res.data;
    renderExtractTab();
    await renderAbstractTab();
    showStatus('abstract-tools', 'AI-shortened abstract applied!', 'success');
  } catch (err) {
    showStatus('abstract-tools', err.message, 'error');
  }
});

document.getElementById('format-latex-btn').addEventListener('click', async () => {
  const journalKey = document.getElementById('journal-select').value;
  try {
    const res = await chrome.runtime.sendMessage({ action: 'formatLatex', journalKey });
    if (res.error) throw new Error(res.error);
    document.getElementById('latex-output').value = res.result.source;
    const changesEl = document.getElementById('latex-changes');
    changesEl.classList.remove('hidden');
    changesEl.innerHTML = `
      <strong>Applied changes for ${escapeHtml(res.result.journal)}:</strong>
      <ul>${res.result.appliedChanges.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
    `;
  } catch (err) {
    showStatus('latex-tools', err.message, 'error');
  }
});

document.getElementById('copy-latex-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('latex-output').value);
  showStatus('latex-tools', 'LaTeX copied!', 'success');
});

document.getElementById('download-latex-btn').addEventListener('click', () => {
  const text = document.getElementById('latex-output').value;
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'manuscript-formatted.tex';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('show-panel-btn').addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'showPanel' });
    showStatus('submit-status', 'Autofill panel shown on page.', 'success');
  } catch {
    showStatus('submit-status', 'Could not connect to page. Navigate to a submission site first.', 'error');
  }
});

document.getElementById('autofill-btn').addEventListener('click', async () => {
  try {
    await chrome.runtime.sendMessage({ action: 'autofillPage' });
    showStatus('submit-status', 'Autofill triggered on current page.', 'success');
  } catch {
    showStatus('submit-status', 'Could not autofill. Navigate to a submission page first.', 'error');
  }
});

document.getElementById('add-author-btn').addEventListener('click', async () => {
  const input = document.getElementById('author-input');
  const name = input.value.trim();
  if (!name || !currentData) return;
  currentData.authors = currentData.authors || [];
  currentData.authors.push({ name, confidence: 1, source: 'manual', index: currentData.authors.length });
  await chrome.runtime.sendMessage({ action: 'updateField', field: 'authors', value: currentData.authors });
  input.value = '';
  renderExtractTab();
});

function showStatus(containerId, message, type) {
  const parent = document.getElementById(containerId);
  let el = parent.querySelector('.inline-status');
  if (!el) {
    el = document.createElement('div');
    el.className = 'status-msg inline-status';
    parent.appendChild(el);
  }
  el.className = `status-msg inline-status ${type}`;
  el.textContent = message;
  setTimeout(() => el.remove(), 3000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

(async () => {
  const res = await chrome.runtime.sendMessage({ action: 'getManuscriptData' });
  if (res?.data) {
    currentData = res.data;
    document.getElementById('file-info').classList.remove('hidden');
    document.getElementById('file-info').innerHTML = `
      <strong>${escapeHtml(currentData.fileName || 'Loaded manuscript')}</strong><br>
      Type: ${currentData.fileType}
    `;
    renderExtractTab();
    await renderAbstractTab();
    await renderLatexTab();
    renderSubmitTab();
  }
})();
