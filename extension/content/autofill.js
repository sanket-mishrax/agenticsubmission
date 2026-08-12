/**
 * Content script — detects journal submission forms and provides autofill.
 * Uses octree journal identification and autofill-mappings for platform-specific fields.
 */

(function () {
  'use strict';

  const PANEL_ID = 'msa-autofill-panel';

  // Inline submission system detection (mirrors autofill-mappings.js)
  const SUBMISSION_SYSTEMS = {
    editorialManager: {
      name: 'Elsevier Editorial Manager',
      patterns: ['editorialmanager.com', 'elsevier.com/editor']
    },
    scholarOne: {
      name: 'Wiley ScholarOne',
      patterns: ['mc.manuscriptcentral.com', 'scholarone.com']
    },
    springer: {
      name: 'Springer Nature Submission',
      patterns: ['submission.springernature.com']
    },
    plos: {
      name: 'PLOS Submission',
      patterns: ['journals.plos.org']
    },
    generic: {
      name: 'Generic Submission Form',
      patterns: []
    }
  };

  const FIELD_SELECTORS = {
    title: ['input[name*="title" i]', 'textarea[name*="title" i]', '#title', 'input[id*="title" i]'],
    abstract: ['textarea[name*="abstract" i]', '#abstract', 'textarea[id*="abstract" i]'],
    keywords: ['input[name*="keyword" i]', 'textarea[name*="keyword" i]'],
    authorFirstName: ['input[name*="first" i][name*="name" i]', 'input[id*="firstName" i]', 'input[name*="given" i]'],
    authorLastName: ['input[name*="last" i][name*="name" i]', 'input[id*="lastName" i]', 'input[name*="family" i]'],
    authorEmail: ['input[type="email"]', 'input[name*="email" i]'],
    affiliation: ['textarea[name*="affiliation" i]', 'input[name*="institution" i]', 'textarea[name*="institution" i]']
  };

  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;

    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div class="msa-panel-header">
        <span class="msa-logo">📝</span>
        <span>Manuscript Assistant</span>
        <button class="msa-close" title="Close">×</button>
      </div>
      <div class="msa-panel-body">
        <p class="msa-system-name" id="msa-system-name">Detecting form...</p>
        <p class="msa-journal-name" id="msa-journal-name"></p>
        <div class="msa-fields" id="msa-detected-fields"></div>
        <button class="msa-btn msa-btn-primary" id="msa-fill-btn">Fill Detected Fields</button>
        <button class="msa-btn msa-btn-secondary" id="msa-fill-all-btn">Fill All Fields</button>
        <div class="msa-status" id="msa-status"></div>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('.msa-close').addEventListener('click', () => {
      panel.style.display = 'none';
    });

    document.getElementById('msa-fill-btn').addEventListener('click', () => fillFields(false));
    document.getElementById('msa-fill-all-btn').addEventListener('click', () => fillFields(true));
  }

  function detectSystem() {
    const hostname = window.location.hostname.toLowerCase();
    for (const [key, system] of Object.entries(SUBMISSION_SYSTEMS)) {
      if (key === 'generic') continue;
      for (const pattern of system.patterns) {
        if (hostname.includes(pattern)) return { key, name: system.name };
      }
    }
    return { key: 'generic', name: SUBMISSION_SYSTEMS.generic.name };
  }

  async function detectJournal() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'identifyJournal',
        url: window.location.href,
        pageTitle: document.title
      });
      return response?.result || null;
    } catch {
      return null;
    }
  }

  function detectFields() {
    const detected = [];
    for (const [name, selectors] of Object.entries(FIELD_SELECTORS)) {
      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel);
          if (el && el.offsetParent !== null) {
            detected.push({ name, element: el, selector: sel });
            break;
          }
        } catch { /* skip */ }
      }
    }
    return detected;
  }

  function setValue(el, value) {
    if (!el) return;
    const setter = el.tagName === 'TEXTAREA'
      ? Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
      : Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function fillFields(fillAll) {
    const status = document.getElementById('msa-status');
    status.textContent = 'Filling...';
    status.className = 'msa-status';

    try {
      const response = await chrome.runtime.sendMessage({ action: 'getManuscriptData' });
      const data = response?.data;
      if (!data) {
        status.textContent = 'No manuscript loaded. Open the extension popup and upload a file first.';
        status.className = 'msa-status msa-error';
        return;
      }

      const values = {
        title: data.title?.value || '',
        abstract: data.abstract?.value || '',
        keywords: data.keywords?.value || '',
        authorEmail: (data.emails || [])[0] || '',
        affiliation: (data.affiliations || []).map(a => a.value).join('; ')
      };

      const authors = data.authors || [];
      if (authors.length > 0) {
        const parts = authors[0].name.trim().split(/\s+/);
        values.authorLastName = parts.length > 1 ? parts.pop() : '';
        values.authorFirstName = parts.join(' ');
      }

      const detected = detectFields();
      let filled = 0;

      for (const field of detected) {
        const value = values[field.name];
        if (value) {
          setValue(field.element, value);
          filled++;
        }
      }

      if (fillAll) {
        // Fill any remaining fields not in detected set
        for (const [name, selectors] of Object.entries(FIELD_SELECTORS)) {
          if (detected.some(d => d.name === name)) continue;
          const value = values[name];
          if (!value) continue;
          for (const sel of selectors) {
            try {
              const el = document.querySelector(sel);
              if (el && el.offsetParent !== null) {
                setValue(el, value);
                filled++;
                break;
              }
            } catch { /* skip */ }
          }
        }
      }

      status.textContent = `Filled ${filled} field(s) successfully.`;
      status.className = 'msa-status msa-success';
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.className = 'msa-status msa-error';
    }
  }

  async function updatePanel() {
    const system = detectSystem();
    document.getElementById('msa-system-name').textContent = system.name;

    const journalResult = await detectJournal();
    const journalEl = document.getElementById('msa-journal-name');
    if (journalResult?.journal) {
      journalEl.textContent = `Journal: ${journalResult.journal.name}`;
      journalEl.style.display = 'block';
    } else {
      journalEl.textContent = '';
      journalEl.style.display = 'none';
    }

    const detected = detectFields();
    const fieldsEl = document.getElementById('msa-detected-fields');
    if (detected.length === 0) {
      fieldsEl.innerHTML = '<p class="msa-no-fields">No submission fields detected on this page.</p>';
    } else {
      fieldsEl.innerHTML = detected.map(f =>
        `<span class="msa-field-tag">${f.name}</span>`
      ).join('');
    }
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'showAutofillPanel') {
      createPanel();
      const panel = document.getElementById(PANEL_ID);
      panel.style.display = 'block';
      updatePanel();
      sendResponse({ ok: true });
    }
    if (message.action === 'autofillNow') {
      createPanel();
      fillFields(true).then(() => sendResponse({ ok: true }));
      return true;
    }
    if (message.action === 'detectFields') {
      sendResponse({ system: detectSystem(), fields: detectFields().map(f => f.name) });
    }
  });

  // Show toggle button on submission-like pages
  const isSubmissionPage = /submit|manuscript|editorial|author|paper/i.test(window.location.href)
    || document.querySelector('textarea[name*="abstract" i], input[name*="title" i]');

  if (isSubmissionPage) {
    createPanel();
    updatePanel();
  }
})();
