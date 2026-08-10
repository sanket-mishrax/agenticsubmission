/**
 * Field mappings for common journal submission systems.
 */

export const SUBMISSION_SYSTEMS = {
  editorialManager: {
    name: 'Elsevier Editorial Manager',
    urlPatterns: ['editorialmanager.com', 'elsevier.com/editor'],
    fields: {
      title: [
        'input[name*="title" i]', 'input[id*="title" i]',
        'textarea[name*="title" i]', '#title', '.title-input'
      ],
      abstract: [
        'textarea[name*="abstract" i]', 'textarea[id*="abstract" i]',
        '#abstract', '.abstract-textarea'
      ],
      keywords: [
        'input[name*="keyword" i]', 'textarea[name*="keyword" i]',
        '#keywords', '.keyword-input'
      ],
      authorFirstName: [
        'input[name*="first" i][name*="name" i]', 'input[id*="firstName" i]'
      ],
      authorLastName: [
        'input[name*="last" i][name*="name" i]', 'input[id*="lastName" i]'
      ],
      authorEmail: [
        'input[name*="email" i][type="email"]', 'input[id*="email" i]'
      ],
      affiliation: [
        'textarea[name*="affiliation" i]', 'input[name*="affiliation" i]',
        'textarea[name*="institution" i]'
      ]
    }
  },
  scholarOne: {
    name: 'Wiley ScholarOne',
    urlPatterns: ['mc.manuscriptcentral.com', 'scholarone.com'],
    fields: {
      title: ['input[name*="manuscriptTitle" i]', 'textarea[name*="title" i]', '#manuscriptTitle'],
      abstract: ['textarea[name*="abstract" i]', '#abstractText'],
      keywords: ['input[name*="keyword" i]', 'textarea[name*="keyword" i]'],
      authorFirstName: ['input[name*="authorFirstName" i]', 'input[name*="firstName" i]'],
      authorLastName: ['input[name*="authorLastName" i]', 'input[name*="lastName" i]'],
      authorEmail: ['input[name*="authorEmail" i]', 'input[type="email"]'],
      affiliation: ['textarea[name*="affiliation" i]', 'input[name*="institution" i]']
    }
  },
  springer: {
    name: 'Springer Nature Submission',
    urlPatterns: ['submission.springernature.com', 'editorialmanager.com/springer'],
    fields: {
      title: ['input[name*="title" i]', '#article-title', 'textarea[name*="title" i]'],
      abstract: ['textarea[name*="abstract" i]', '#abstract'],
      keywords: ['input[name*="keyword" i]', 'textarea[name*="keyword" i]'],
      authorEmail: ['input[type="email"]', 'input[name*="email" i]'],
      affiliation: ['textarea[name*="affiliation" i]', 'input[name*="institution" i]']
    }
  },
  generic: {
    name: 'Generic Submission Form',
    urlPatterns: ['*'],
    fields: {
      title: [
        'input[name*="title" i]', 'textarea[name*="title" i]',
        'input[id*="title" i]', 'textarea[id*="title" i]',
        'input[placeholder*="title" i]', 'textarea[placeholder*="title" i]'
      ],
      abstract: [
        'textarea[name*="abstract" i]', 'textarea[id*="abstract" i]',
        'textarea[placeholder*="abstract" i]', 'div[contenteditable][data-field="abstract"]'
      ],
      keywords: [
        'input[name*="keyword" i]', 'textarea[name*="keyword" i]',
        'input[placeholder*="keyword" i]'
      ],
      authorFirstName: [
        'input[name*="first" i]', 'input[name*="given" i]',
        'input[placeholder*="first" i]'
      ],
      authorLastName: [
        'input[name*="last" i]', 'input[name*="family" i]',
        'input[placeholder*="last" i]'
      ],
      authorEmail: [
        'input[type="email"]', 'input[name*="email" i]',
        'input[placeholder*="email" i]'
      ],
      affiliation: [
        'textarea[name*="affiliation" i]', 'input[name*="affiliation" i]',
        'textarea[name*="institution" i]', 'input[name*="organization" i]'
      ]
    }
  }
};

/**
 * Detect which submission system the current page belongs to.
 */
export function detectSubmissionSystem(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  for (const [key, system] of Object.entries(SUBMISSION_SYSTEMS)) {
    if (key === 'generic') continue;
    for (const pattern of system.urlPatterns) {
      if (hostname.includes(pattern.replace('*.', ''))) {
        return { key, ...system };
      }
    }
  }
  return { key: 'generic', ...SUBMISSION_SYSTEMS.generic };
}

/**
 * Find the first matching element for a list of selectors.
 */
export function findField(selectors) {
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector);
      if (el && isVisible(el)) return el;
    } catch {
      // Invalid selector, skip
    }
  }
  return null;
}

function isVisible(el) {
  if (!el) return false;
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
}

/**
 * Set value on form field, triggering input events.
 */
export function setFieldValue(el, value) {
  if (!el || value == null) return false;

  if (el.isContentEditable) {
    el.textContent = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  )?.set;
  const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set;

  if (el.tagName === 'INPUT' && nativeInputValueSetter) {
    nativeInputValueSetter.call(el, value);
  } else if (el.tagName === 'TEXTAREA' && nativeTextareaSetter) {
    nativeTextareaSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

/**
 * Split full name into first and last.
 */
export function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  const lastName = parts.pop();
  return { firstName: parts.join(' '), lastName };
}

/**
 * Build field values map from manuscript metadata.
 */
export function buildFieldValues(manuscriptData) {
  if (!manuscriptData) return {};

  const authors = manuscriptData.authors || [];
  const firstAuthor = authors[0];
  const nameParts = firstAuthor ? splitName(firstAuthor.name) : { firstName: '', lastName: '' };

  return {
    title: manuscriptData.title?.value || '',
    abstract: manuscriptData.abstract?.value || '',
    keywords: manuscriptData.keywords?.value || '',
    authorFirstName: nameParts.firstName,
    authorLastName: nameParts.lastName,
    authorEmail: (manuscriptData.emails || [])[0] || '',
    affiliation: (manuscriptData.affiliations || []).map(a => a.value).join('; ')
  };
}

/**
 * Autofill all detectable fields on the page.
 */
export function autofillPage(manuscriptData, system) {
  const values = buildFieldValues(manuscriptData);
  const results = [];

  for (const [fieldName, selectors] of Object.entries(system.fields)) {
    const el = findField(selectors);
    const value = values[fieldName];
    if (el && value) {
      const filled = setFieldValue(el, value);
      results.push({ field: fieldName, filled, selector: selectors.find(s => {
        try { return document.querySelector(s) === el; } catch { return false; }
      })});
    }
  }

  return results;
}
