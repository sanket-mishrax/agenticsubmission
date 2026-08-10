/**
 * Content script — detects journal submission forms and provides autofill.
 */

(function () {
  'use strict';

  const browserAPI = globalThis.browser ?? globalThis.chrome;
  const PANEL_ID = 'msa-autofill-panel';

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
    const systems = {
      'editorialmanager.com': 'Elsevier Editorial Manager',
      'mc.manuscriptcentral.com': 'Wiley ScholarOne',
      'submission.springernature.com': 'Springer Nature',
      'journals.plos.org': 'PLOS',
      'arxiv.org': 'arXiv'
    };
    for (const [pattern, name] of Object.entries(systems)) {
      if (hostname.includes(pattern)) return name;
    }
    return 'Generic submission form';
  }

  function detectFields() {
    const fieldDefs = {
      title: ['input[name*="title" i]', 'textarea[name*="title" i]', '#title'],
      abstract: ['textarea[name*="abstract" i]', '#abstract'],
      keywords: ['input[name*="keyword" i]', 'textarea[name*="keyword" i]'],
      email: ['input[type="email"]', 'input[name*="email" i]'],
      affiliation: ['textarea[name*="affiliation" i]', 'input[name*="institution" i]']
    };

    const detected = [];
    for (const [name, selectors] of Object.entries(fieldDefs)) {
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

  function splitName(full) {
    const parts = full.trim().split(/\s+/);
    if (parts.length <= 1) return { first: parts[0] || '', last: '' };
    return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
  }

  async function fillFields(fillAll) {
    const status = document.getElementById('msa-status');
    status.textContent = 'Filling...';
    status.className = 'msa-status';

    try {
      const response = await browserAPI.runtime.sendMessage({ action: 'getManuscriptData' });
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
        email: (data.emails || [])[0] || '',
        affiliation: (data.affiliations || []).map(a => a.value).join('; ')
      };

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
        // Also try first/last name fields
        const authors = data.authors || [];
        if (authors.length > 0) {
          const { first, last } = splitName(authors[0].name);
          const firstEl = document.querySelector('input[name*="first" i], input[id*="firstName" i]');
          const lastEl = document.querySelector('input[name*="last" i], input[id*="lastName" i]');
          if (firstEl && first) { setValue(firstEl, first); filled++; }
          if (lastEl && last) { setValue(lastEl, last); filled++; }
        }
      }

      status.textContent = `Filled ${filled} field(s) successfully.`;
      status.className = 'msa-status msa-success';
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.className = 'msa-status msa-error';
    }
  }

  function updatePanel() {
    const systemName = detectSystem();
    document.getElementById('msa-system-name').textContent = systemName;

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

  browserAPI.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
