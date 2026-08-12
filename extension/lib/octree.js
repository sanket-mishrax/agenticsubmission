/**
 * Journal Octree — hierarchical taxonomy for journal classification,
 * field-requirement lookup, and manuscript-to-journal matching.
 *
 * Each internal node partitions by discipline domain (up to 8 branches per level).
 * Leaf nodes hold journal entries with submission metadata and required fields.
 */

/** Standard submission fields the extension can extract and autofill. */
export const SUBMISSION_FIELDS = [
  'title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails',
  'coverLetter', 'highlights', 'runningTitle', 'subjectArea', 'funding',
  'conflictsOfInterest', 'dataAvailability'
];

/**
 * Journal registry — each entry links to a submission platform and LaTeX template.
 */
export const JOURNAL_REGISTRY = {
  'nature-communications': {
    id: 'nature-communications',
    name: 'Nature Communications',
    publisher: 'Nature Portfolio',
    submissionUrl: 'https://www.nature.com/ncomms/submit',
    submissionPlatform: 'springer',
    latexTemplate: 'nature',
    abstractWordLimit: 200,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails', 'coverLetter'],
    optionalFields: ['highlights', 'funding', 'conflictsOfInterest', 'dataAvailability'],
    topics: ['multidisciplinary', 'natural sciences', 'biology', 'physics', 'chemistry', 'materials'],
    issn: '2041-1723'
  },
  'scientific-reports': {
    id: 'scientific-reports',
    name: 'Scientific Reports',
    publisher: 'Nature Portfolio',
    submissionUrl: 'https://www.nature.com/srep/submit',
    submissionPlatform: 'springer',
    latexTemplate: 'nature',
    abstractWordLimit: 200,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['funding', 'conflictsOfInterest', 'dataAvailability'],
    topics: ['multidisciplinary', 'natural sciences', 'open access', 'biology', 'medicine'],
    issn: '2045-2322'
  },
  'plos-one': {
    id: 'plos-one',
    name: 'PLOS ONE',
    publisher: 'PLOS',
    submissionUrl: 'https://journals.plos.org/plosone/s/submit',
    submissionPlatform: 'editorialManager',
    latexTemplate: 'plos',
    abstractWordLimit: 300,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails', 'subjectArea'],
    optionalFields: ['funding', 'conflictsOfInterest', 'dataAvailability'],
    topics: ['multidisciplinary', 'biology', 'medicine', 'life sciences', 'open access'],
    issn: '1932-6203'
  },
  'ieee-tpami': {
    id: 'ieee-tpami',
    name: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
    publisher: 'IEEE',
    submissionUrl: 'https://mc.manuscriptcentral.com/tpami-ieee',
    submissionPlatform: 'scholarOne',
    latexTemplate: 'ieee',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails', 'coverLetter'],
    optionalFields: ['highlights', 'funding', 'conflictsOfInterest'],
    topics: ['computer vision', 'machine learning', 'pattern recognition', 'artificial intelligence', 'deep learning'],
    issn: '0162-8828'
  },
  'ieee-tnnls': {
    id: 'ieee-tnnls',
    name: 'IEEE Transactions on Neural Networks and Learning Systems',
    publisher: 'IEEE',
    submissionUrl: 'https://mc.manuscriptcentral.com/tnnls',
    submissionPlatform: 'scholarOne',
    latexTemplate: 'ieee',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['funding', 'conflictsOfInterest'],
    topics: ['neural networks', 'machine learning', 'deep learning', 'artificial intelligence'],
    issn: '2162-237X'
  },
  'elsevier-neurocomputing': {
    id: 'elsevier-neurocomputing',
    name: 'Neurocomputing',
    publisher: 'Elsevier',
    submissionUrl: 'https://www.editorialmanager.com/neucom',
    submissionPlatform: 'editorialManager',
    latexTemplate: 'elsevier',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails', 'highlights'],
    optionalFields: ['funding', 'conflictsOfInterest', 'dataAvailability'],
    topics: ['neural networks', 'machine learning', 'computational neuroscience', 'artificial intelligence'],
    issn: '0925-2312'
  },
  'acm-tocs': {
    id: 'acm-tocs',
    name: 'ACM Transactions on Computer Systems',
    publisher: 'ACM',
    submissionUrl: 'https://mc.manuscriptcentral.com/tocs',
    submissionPlatform: 'scholarOne',
    latexTemplate: 'acm',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['funding', 'conflictsOfInterest'],
    topics: ['computer systems', 'distributed systems', 'operating systems', 'computer science'],
    issn: '0734-2071'
  },
  'springer-jmlr': {
    id: 'springer-jmlr',
    name: 'Journal of Machine Learning Research',
    publisher: 'JMLR',
    submissionUrl: 'https://jmlr.org/author-info.html',
    submissionPlatform: 'generic',
    latexTemplate: 'generic',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['funding', 'dataAvailability'],
    topics: ['machine learning', 'statistics', 'artificial intelligence', 'deep learning'],
    issn: '1533-7928'
  },
  'wiley-ai': {
    id: 'wiley-ai',
    name: 'Applied Intelligence',
    publisher: 'Wiley',
    submissionUrl: 'https://mc.manuscriptcentral.com/apin',
    submissionPlatform: 'scholarOne',
    latexTemplate: 'wiley',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['coverLetter', 'funding'],
    topics: ['artificial intelligence', 'machine learning', 'intelligent systems', 'data mining'],
    issn: '0924-669X'
  },
  'elsevier-bioinformatics': {
    id: 'elsevier-bioinformatics',
    name: 'Bioinformatics',
    publisher: 'Oxford/Elsevier',
    submissionUrl: 'https://www.editorialmanager.com/bioinf',
    submissionPlatform: 'editorialManager',
    latexTemplate: 'elsevier',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['funding', 'dataAvailability', 'conflictsOfInterest'],
    topics: ['bioinformatics', 'computational biology', 'genomics', 'systems biology', 'life sciences'],
    issn: '1367-4803'
  },
  'nature-biotech': {
    id: 'nature-biotech',
    name: 'Nature Biotechnology',
    publisher: 'Nature Portfolio',
    submissionUrl: 'https://www.nature.com/nbt/submit',
    submissionPlatform: 'springer',
    latexTemplate: 'nature',
    abstractWordLimit: 150,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails', 'coverLetter'],
    optionalFields: ['highlights', 'funding', 'conflictsOfInterest'],
    topics: ['biotechnology', 'genomics', 'drug discovery', 'life sciences', 'medicine'],
    issn: '1087-0156'
  },
  'ieee-access': {
    id: 'ieee-access',
    name: 'IEEE Access',
    publisher: 'IEEE',
    submissionUrl: 'https://ieee.atyponrex.com/journal/ieee-access',
    submissionPlatform: 'generic',
    latexTemplate: 'ieee',
    abstractWordLimit: 250,
    requiredFields: ['title', 'abstract', 'keywords', 'authors', 'affiliations', 'emails'],
    optionalFields: ['funding', 'conflictsOfInterest'],
    topics: ['engineering', 'computer science', 'multidisciplinary', 'open access', 'technology'],
    issn: '2169-3536'
  }
};

/**
 * Octree node — partitions journals by domain keywords.
 */
class OctreeNode {
  constructor(label, depth = 0) {
    this.label = label;
    this.depth = depth;
    this.children = {};
    this.journalIds = [];
  }

  addChild(key, node) {
    this.children[key] = node;
  }

  getChild(key) {
    return this.children[key] || null;
  }
}

/**
 * Build the journal classification octree.
 * Top-level octants: cs, life, engineering, physics, medicine, multidisciplinary, social, chemistry
 */
function buildJournalOctree() {
  const root = new OctreeNode('root');

  const domains = {
    cs: {
      label: 'Computer Science & AI',
      journals: ['ieee-tpami', 'ieee-tnnls', 'elsevier-neurocomputing', 'acm-tocs', 'springer-jmlr', 'wiley-ai']
    },
    life: {
      label: 'Life Sciences & Biology',
      journals: ['plos-one', 'elsevier-bioinformatics', 'nature-biotech']
    },
    multidisciplinary: {
      label: 'Multidisciplinary',
      journals: ['nature-communications', 'scientific-reports', 'plos-one', 'ieee-access']
    },
    engineering: {
      label: 'Engineering & Technology',
      journals: ['ieee-access', 'ieee-tpami', 'acm-tocs']
    },
    medicine: {
      label: 'Medicine & Health',
      journals: ['plos-one', 'nature-biotech', 'scientific-reports']
    }
  };

  for (const [key, domain] of Object.entries(domains)) {
    const node = new OctreeNode(domain.label, 1);
    node.journalIds = domain.journals;
    root.addChild(key, node);
  }

  return root;
}

const journalOctree = buildJournalOctree();

/**
 * Extract journal-related hints from manuscript text.
 */
export function extractJournalHints(text, fileType) {
  const hints = [];
  const lower = text.toLowerCase();

  // LaTeX journal commands
  const journalCmd = text.match(/\\journalname\{([^}]+)\}/i) ||
    text.match(/\\journal\{([^}]+)\}/i);
  if (journalCmd) {
    hints.push({ type: 'latex_command', value: journalCmd[1].trim(), confidence: 0.95 });
  }

  // Document class hints
  const docClass = text.match(/\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}/);
  if (docClass) {
    const cls = docClass[1].toLowerCase();
    const classMap = {
      elsarticle: 'elsevier',
      svjour3: 'springer',
      ieeetran: 'ieee',
      acmart: 'acm',
      wileynjdv5: 'wiley'
    };
    for (const [clsName, publisher] of Object.entries(classMap)) {
      if (cls.includes(clsName)) {
        hints.push({ type: 'document_class', value: publisher, confidence: 0.85 });
      }
    }
  }

  // Bibliography style hints
  const bibStyle = text.match(/\\bibliographystyle\{([^}]+)\}/);
  if (bibStyle) {
    const style = bibStyle[1].toLowerCase();
    const styleMap = {
      'elsarticle-num': 'elsevier',
      spbasic: 'springer',
      ieeetran: 'ieee',
      naturemag: 'nature',
      'acm-reference-format': 'acm',
      plos2015: 'plos',
      'wiley-njd-ama': 'wiley'
    };
    for (const [styleName, publisher] of Object.entries(styleMap)) {
      if (style.includes(styleName)) {
        hints.push({ type: 'bibliography_style', value: publisher, confidence: 0.8 });
      }
    }
  }

  // Target journal mentions in text
  for (const journal of Object.values(JOURNAL_REGISTRY)) {
    if (lower.includes(journal.name.toLowerCase())) {
      hints.push({ type: 'text_mention', value: journal.id, confidence: 0.9 });
    }
  }

  return hints;
}

/**
 * Tokenize text into searchable terms.
 */
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

/**
 * Score a journal against manuscript metadata.
 */
function scoreJournal(journal, metadata, hints) {
  let score = 0;
  const reasons = [];

  const searchText = [
    metadata.title?.value,
    metadata.abstract?.value,
    metadata.keywords?.value
  ].filter(Boolean).join(' ').toLowerCase();

  const tokens = new Set(tokenize(searchText));

  // Topic keyword overlap
  for (const topic of journal.topics) {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const matches = topicWords.filter(w => tokens.has(w) || searchText.includes(w));
    if (matches.length > 0) {
      const topicScore = matches.length / topicWords.length;
      score += topicScore * 0.4;
      reasons.push(`Topic match: ${topic}`);
    }
  }

  // Direct keyword overlap
  const kwList = (metadata.keywords?.value || '').split(/[,;]/).map(k => k.trim().toLowerCase()).filter(Boolean);
  for (const kw of kwList) {
    if (journal.topics.some(t => t.includes(kw) || kw.includes(t))) {
      score += 0.3;
      reasons.push(`Keyword match: ${kw}`);
    }
  }

  // Journal hints from manuscript
  for (const hint of hints) {
    if (hint.type === 'text_mention' && hint.value === journal.id) {
      score += 0.5;
      reasons.push('Journal mentioned in manuscript');
    }
    if (hint.type === 'latex_command') {
      const hintLower = hint.value.toLowerCase();
      if (journal.name.toLowerCase().includes(hintLower) || hintLower.includes(journal.name.toLowerCase())) {
        score += 0.45;
        reasons.push(`LaTeX journal hint: ${hint.value}`);
      }
    }
    if (hint.type === 'document_class' || hint.type === 'bibliography_style') {
      if (journal.latexTemplate === hint.value || journal.publisher.toLowerCase().includes(hint.value)) {
        score += 0.2;
        reasons.push(`Publisher/style hint: ${hint.value}`);
      }
    }
  }

  return { score: Math.min(score, 1), reasons: [...new Set(reasons)] };
}

/**
 * Match manuscript metadata to relevant journals.
 * Returns ranked list of journal suggestions with field requirements.
 */
export function matchJournals(metadata, options = {}) {
  const hints = metadata.journalHints || extractJournalHints(
    metadata.rawText || [metadata.title?.value, metadata.abstract?.value, metadata.keywords?.value].join('\n'),
    metadata.fileType
  );

  const limit = options.limit || 5;
  const minScore = options.minScore || 0.1;
  const results = [];

  for (const journal of Object.values(JOURNAL_REGISTRY)) {
    const { score, reasons } = scoreJournal(journal, metadata, hints);
    if (score >= minScore) {
      results.push({
        journal,
        score,
        reasons,
        submissionFields: getJournalSubmissionFields(journal, metadata)
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}

/**
 * Get submission field map for a journal — what to fill and what's missing.
 */
export function getJournalSubmissionFields(journal, metadata) {
  const allFields = [...journal.requiredFields, ...journal.optionalFields];
  const fields = {};

  const fieldExtractors = {
    title: () => metadata.title?.value || '',
    abstract: () => metadata.abstract?.value || '',
    keywords: () => metadata.keywords?.value || '',
    authors: () => (metadata.authors || []).map(a => a.name).join(', '),
    affiliations: () => (metadata.affiliations || []).map(a => a.value).join('; '),
    emails: () => (metadata.emails || []).join(', '),
    coverLetter: () => metadata.coverLetter?.value || '',
    highlights: () => metadata.highlights?.value || '',
    runningTitle: () => metadata.runningTitle?.value || (metadata.title?.value || '').slice(0, 50),
    subjectArea: () => metadata.subjectArea?.value || '',
    funding: () => metadata.funding?.value || '',
    conflictsOfInterest: () => metadata.conflictsOfInterest?.value || '',
    dataAvailability: () => metadata.dataAvailability?.value || ''
  };

  for (const fieldName of allFields) {
    const extractor = fieldExtractors[fieldName];
    const value = extractor ? extractor() : '';
    fields[fieldName] = {
      value,
      required: journal.requiredFields.includes(fieldName),
      filled: Boolean(value && value.trim()),
      autofillable: Boolean(extractor)
    };
  }

  const requiredMissing = Object.entries(fields)
    .filter(([, f]) => f.required && !f.filled)
    .map(([name]) => name);

  const abstractWordCount = metadata.abstract?.wordCount || 0;
  const abstractOk = abstractWordCount <= journal.abstractWordLimit;

  return {
    fields,
    requiredMissing,
    abstractWordLimit: journal.abstractWordLimit,
    abstractWordCount,
    abstractOk,
    readyToSubmit: requiredMissing.length === 0 && abstractOk
  };
}

/**
 * Identify journal from a submission page URL or page title.
 */
export function identifyJournalFromUrl(url, pageTitle = '') {
  const urlLower = url.toLowerCase();
  const titleLower = (pageTitle || '').toLowerCase();
  const results = [];

  for (const journal of Object.values(JOURNAL_REGISTRY)) {
    let score = 0;
    const reasons = [];

    const urlSlug = journal.id.replace(/-/g, '');
    const nameSlug = journal.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (urlLower.includes(journal.id) || urlLower.includes(nameSlug) || urlLower.includes(urlSlug)) {
      score += 0.6;
      reasons.push('URL matches journal');
    }

    if (titleLower.includes(journal.name.toLowerCase())) {
      score += 0.4;
      reasons.push('Page title matches journal');
    }

    // Platform-specific URL patterns
    const platformPatterns = {
      editorialManager: ['editorialmanager.com'],
      scholarOne: ['mc.manuscriptcentral.com', 'scholarone.com'],
      springer: ['submission.springernature.com']
    };
    const patterns = platformPatterns[journal.submissionPlatform] || [];
    if (patterns.some(p => urlLower.includes(p))) {
      score += 0.1;
      reasons.push(`On ${journal.submissionPlatform} platform`);
    }

    if (score > 0) {
      results.push({ journal, score, reasons });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results[0] || null;
}

/**
 * Traverse octree to get journals in a domain.
 */
export function getJournalsByDomain(domainKey) {
  const node = journalOctree.getChild(domainKey);
  if (!node) return [];
  return node.journalIds
    .map(id => JOURNAL_REGISTRY[id])
    .filter(Boolean);
}

/**
 * List all domains in the octree.
 */
export function getDomainList() {
  return Object.entries(journalOctree.children).map(([key, node]) => ({
    key,
    label: node.label,
    journalCount: node.journalIds.length
  }));
}

/**
 * Get a journal by ID with full submission field schema.
 */
export function getJournalById(journalId) {
  return JOURNAL_REGISTRY[journalId] || null;
}

/**
 * Get all journals for UI listing.
 */
export function getAllJournals() {
  return Object.values(JOURNAL_REGISTRY);
}

/**
 * Build enriched submission package from metadata + target journal.
 */
export function buildSubmissionPackage(metadata, journalId) {
  const journal = getJournalById(journalId);
  if (!journal) return null;

  const submissionFields = getJournalSubmissionFields(journal, metadata);

  return {
    journal,
    submissionFields,
    submissionUrl: journal.submissionUrl,
    submissionPlatform: journal.submissionPlatform,
    latexTemplate: journal.latexTemplate,
    abstractWordLimit: journal.abstractWordLimit,
    readyToSubmit: submissionFields.readyToSubmit,
    missingFields: submissionFields.requiredMissing
  };
}
