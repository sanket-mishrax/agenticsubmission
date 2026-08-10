/**
 * LaTeX journal template formatter — applies minor source changes for target journals.
 */

export const JOURNAL_TEMPLATES = {
  generic: {
    name: 'Generic Article',
    documentClass: 'article',
    options: ['11pt', 'a4paper'],
    packages: ['amsmath', 'graphicx', 'hyperref'],
    bibliography: 'plain',
    abstractEnv: 'abstract',
    changes: []
  },
  elsevier: {
    name: 'Elsevier (elsarticle)',
    documentClass: 'elsarticle',
    options: ['review', '3p'],
    packages: ['amsmath', 'graphicx', 'lineno'],
    bibliography: 'elsarticle-num',
    abstractEnv: 'abstract',
    changes: [
      'Replace \\documentclass with \\documentclass[review,3p]{elsarticle}',
      'Add \\usepackage{lineno} and \\linenumbers for review',
      'Use \\bibliographystyle{elsarticle-num}'
    ]
  },
  springer: {
    name: 'Springer (svjour3)',
    documentClass: 'svjour3',
    options: [],
    packages: ['amsmath', 'graphicx'],
    bibliography: 'spbasic',
    abstractEnv: 'abstract',
    changes: [
      'Replace \\documentclass with \\documentclass{svjour3}',
      'Use \\smartqed for QED symbol',
      'Use \\bibliographystyle{spbasic}'
    ]
  },
  ieee: {
    name: 'IEEE Transactions',
    documentClass: 'IEEEtran',
    options: ['journal'],
    packages: ['amsmath', 'graphicx', 'cite'],
    bibliography: 'IEEEtran',
    abstractEnv: 'abstract',
    changes: [
      'Replace \\documentclass with \\documentclass[journal]{IEEEtran}',
      'Use \\IEEEauthorblockN and \\IEEEauthorblockA for authors',
      'Use \\bibliographystyle{IEEEtran}'
    ]
  },
  nature: {
    name: 'Nature / Scientific Reports style',
    documentClass: 'article',
    options: ['12pt', 'a4paper'],
    packages: ['amsmath', 'graphicx', 'natbib'],
    bibliography: 'naturemag',
    abstractEnv: 'abstract',
    changes: [
      'Use \\documentclass[12pt,a4paper]{article}',
      'Add \\usepackage[numbers,sort&compress]{natbib}',
      'Use \\bibliographystyle{naturemag}',
      'Abstract should be unreferenced, under 200 words'
    ]
  },
  acm: {
    name: 'ACM Conference/Journal',
    documentClass: 'acmart',
    options: ['sigconf'],
    packages: [],
    bibliography: 'ACM-Reference-Format',
    abstractEnv: 'abstract',
    changes: [
      'Replace with \\documentclass[sigconf]{acmart}',
      'Use ACM CCS concepts and keywords commands',
      'Use \\bibliographystyle{ACM-Reference-Format}'
    ]
  },
  plos: {
    name: 'PLOS ONE',
    documentClass: 'article',
    options: ['10pt', 'a4paper'],
    packages: ['amsmath', 'graphicx'],
    bibliography: 'plos2015',
    abstractEnv: 'abstract',
    changes: [
      'Use \\documentclass[10pt,a4paper]{article}',
      'Structured abstract with Background/Methods/Results/Conclusions if required',
      'Use \\bibliographystyle{plos2015}'
    ]
  },
  wiley: {
    name: 'Wiley Journals',
    documentClass: 'WileyNJDv5',
    options: [],
    packages: ['amsmath', 'graphicx'],
    bibliography: 'WileyNJD-AMA',
    abstractEnv: 'abstract',
    changes: [
      'Use Wiley document class WileyNJDv5',
      'Follow Wiley author affiliation format',
      'Use \\bibliographystyle{WileyNJD-AMA}'
    ]
  }
};

/**
 * Apply journal template transformations to LaTeX source.
 */
export function formatLatexForJournal(latexSource, journalKey) {
  const template = JOURNAL_TEMPLATES[journalKey] || JOURNAL_TEMPLATES.generic;
  let source = latexSource;
  const appliedChanges = [];

  // Replace document class
  const classOptions = template.options.length > 0
    ? `[${template.options.join(',')}]`
    : '';
  const newClass = `\\documentclass${classOptions}{${template.documentClass}}`;

  if (/\\documentclass(\[[^\]]*\])?\{[^}]+\}/.test(source)) {
    source = source.replace(/\\documentclass(\[[^\]]*\])?\{[^}]+\}/, newClass);
    appliedChanges.push(`Document class → ${template.documentClass}`);
  } else {
    source = `${newClass}\n${source}`;
    appliedChanges.push(`Added document class ${template.documentClass}`);
  }

  // Ensure required packages
  for (const pkg of template.packages) {
    const pkgCmd = `\\usepackage{${pkg}}`;
    if (!source.includes(pkgCmd) && !source.includes(`{${pkg}}`)) {
      const insertPoint = source.indexOf('\\begin{document}');
      if (insertPoint > -1) {
        source = source.slice(0, insertPoint) + pkgCmd + '\n' + source.slice(insertPoint);
      } else {
        source = pkgCmd + '\n' + source;
      }
      appliedChanges.push(`Added package: ${pkg}`);
    }
  }

  // Update bibliography style
  const bibStyle = `\\bibliographystyle{${template.bibliography}}`;
  if (/\\bibliographystyle\{[^}]+\}/.test(source)) {
    source = source.replace(/\\bibliographystyle\{[^}]+\}/, bibStyle);
    appliedChanges.push(`Bibliography style → ${template.bibliography}`);
  } else if (source.includes('\\bibliography{')) {
    source = source.replace(/(\\bibliography\{[^}]+\})/, `${bibStyle}\n$1`);
    appliedChanges.push(`Added bibliography style ${template.bibliography}`);
  }

  // Journal-specific author formatting
  if (journalKey === 'ieee' && source.includes('\\author{')) {
    source = convertAuthorsToIEEE(source);
    appliedChanges.push('Converted author block to IEEE format');
  }

  if (journalKey === 'elsevier' && !source.includes('\\linenumbers')) {
    const docStart = source.indexOf('\\begin{document}');
    if (docStart > -1) {
      const afterDoc = docStart + '\\begin{document}'.length;
      source = source.slice(0, afterDoc) + '\n\\linenumbers\n' + source.slice(afterDoc);
      appliedChanges.push('Added line numbers for Elsevier review');
    }
  }

  return {
    source,
    journal: template.name,
    journalKey,
    appliedChanges,
    notes: template.changes
  };
}

/**
 * Convert generic \\author{} to IEEE format.
 */
function convertAuthorsToIEEE(source) {
  const authorMatch = source.match(/\\author\{([\s\S]*?)\}/);
  if (!authorMatch) return source;

  const raw = authorMatch[1];
  const authors = raw.split(/\\and\b|\\\\/).map(a => a.trim()).filter(Boolean);

  const ieeeBlock = authors.map(author => {
    const clean = author.replace(/\\thanks\{[^}]*\}/g, '').trim();
    const parts = clean.split(/,|\n/).map(p => p.trim()).filter(Boolean);
    const name = parts[0] || clean;
    const affiliation = parts.slice(1).join(', ') || '';
    return `\\IEEEauthorblockN{${name}}\n\\IEEEauthorblockA{${affiliation}}`;
  }).join('\\\\\n');

  return source.replace(/\\author\{[\s\S]*?\}/, `\\author{\n${ieeeBlock}\n}`);
}

/**
 * Get list of available journals for UI.
 */
export function getJournalList() {
  return Object.entries(JOURNAL_TEMPLATES).map(([key, t]) => ({
    key,
    name: t.name
  }));
}
