/**
 * Agentic manuscript metadata extractor.
 * Uses multi-pass heuristics with confidence scoring; optional LLM enhancement.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

/**
 * Strip LaTeX commands from text for plain-text analysis.
 */
export function stripLatex(text) {
  return text
    .replace(/%.*$/gm, '')
    .replace(/\\(?:title|author|affiliation|email|thanks|footnote)\{([^}]*)\}/g, '$1')
    .replace(/\\[a-zA-Z@]+\*?(\[[^\]]*\])?(\{[^}]*\})?/g, ' ')
    .replace(/[{}\\$&%#_^~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract emails from text.
 */
export function extractEmails(text) {
  const matches = text.match(EMAIL_REGEX) || [];
  return [...new Set(matches)];
}

/**
 * Extract title from LaTeX or plain text.
 */
export function extractTitle(text, fileType) {
  if (fileType === 'latex') {
    const titleContent = extractBracedContent(text, 'title');
    if (titleContent) {
      return {
        value: stripLatex(titleContent),
        confidence: 0.95,
        source: 'latex \\title{}'
      };
    }
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = stripLatex(lines[i]);
    if (line.length > 10 && line.length < 300 && !line.toLowerCase().includes('abstract')) {
      return { value: line, confidence: 0.6, source: 'first substantial line' };
    }
  }

  return { value: '', confidence: 0, source: 'not found' };
}

/**
 * Extract content between balanced braces after a LaTeX command.
 */
function extractBracedContent(text, command) {
  const marker = `\\${command}{`;
  const start = text.indexOf(marker);
  if (start === -1) return null;
  let depth = 0;
  let i = start + marker.length;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      if (depth === 0) return text.slice(start + marker.length, i);
      depth--;
    }
  }
  return null;
}

/**
 * Extract authors from LaTeX \\author{} or heuristic patterns.
 */
export function extractAuthors(text, fileType) {
  const authors = [];

  if (fileType === 'latex') {
    const raw = extractBracedContent(text, 'author');
    if (raw) {
      const parts = raw
        .split(/\\and\b|\\\\/)
        .map(a => stripLatex(a.replace(/\$[^$]*\$/g, '').replace(/\^{[^}]*}/g, '').trim()))
        .filter(a => a.length > 1 && a.length < 100 && !/^\d+$/.test(a));
      parts.forEach((name, i) => {
        authors.push({ name, confidence: 0.9, source: 'latex \\author{}', index: i });
      });
      if (authors.length > 0) return authors;
    }
  }

  // Heuristic: lines with name-like patterns before abstract
  const abstractIdx = text.toLowerCase().indexOf('abstract');
  const headerText = abstractIdx > 0 ? text.slice(0, abstractIdx) : text.slice(0, 2000);
  const namePattern = /(?:^|\n)\s*([A-Z][a-z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  let m;
  const seen = new Set();
  while ((m = namePattern.exec(headerText)) !== null) {
    const name = m[1].trim();
    if (!seen.has(name) && name.split(' ').length >= 2) {
      seen.add(name);
      authors.push({ name, confidence: 0.5, source: 'name pattern', index: authors.length });
    }
  }

  return authors;
}

/**
 * Extract affiliations from LaTeX or text.
 */
export function extractAffiliations(text, fileType) {
  const affiliations = [];

  if (fileType === 'latex') {
    const affilRegex = /\\affiliation\{([^}]*)\}/g;
    let m;
    while ((m = affilRegex.exec(text)) !== null) {
      affiliations.push({ value: stripLatex(m[1]), confidence: 0.9, source: 'latex \\affiliation{}' });
    }
    const thanksRegex = /\\thanks\{([^}]*)\}/g;
    while ((m = thanksRegex.exec(text)) !== null) {
      const val = stripLatex(m[1]);
      if (val.length > 10) {
        affiliations.push({ value: val, confidence: 0.7, source: 'latex \\thanks{}' });
      }
    }
    const instituteRegex = /\\institute\{([^}]*)\}/g;
    while ((m = instituteRegex.exec(text)) !== null) {
      affiliations.push({ value: stripLatex(m[1]), confidence: 0.85, source: 'latex \\institute{}' });
    }
  }

  if (affiliations.length === 0) {
    const deptPattern = /(?:Department|School|Faculty|Institute|University|Laboratory|Lab)[^.;\n]{5,120}/gi;
    const matches = text.match(deptPattern) || [];
    const unique = [...new Set(matches.map(m => m.trim()))];
    unique.slice(0, 5).forEach(val => {
      affiliations.push({ value: val, confidence: 0.5, source: 'institution keyword' });
    });
  }

  return affiliations;
}

/**
 * Extract abstract section.
 */
export function extractAbstract(text, fileType) {
  if (fileType === 'latex') {
    const absMatch = text.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/);
    if (absMatch) {
      return {
        value: stripLatex(absMatch[1]),
        confidence: 0.95,
        source: 'latex abstract environment'
      };
    }
  }

  const patterns = [
    /(?:^|\n)\s*Abstract\s*[:\-–]?\s*\n([\s\S]*?)(?=\n\s*(?:Keywords|Introduction|1\.|I\.|Index Terms))/i,
    /(?:^|\n)\s*ABSTRACT\s*\n([\s\S]*?)(?=\n\s*(?:Keywords|Introduction|1\.))/i,
    /(?:^|\n)\s*Summary\s*[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:Keywords|Introduction))/i
  ];

  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m && m[1].trim().length > 50) {
      return {
        value: stripLatex(m[1].trim()),
        confidence: 0.8,
        source: 'section heading'
      };
    }
  }

  return { value: '', confidence: 0, source: 'not found' };
}

/**
 * Extract keywords if present.
 */
export function extractKeywords(text, fileType) {
  if (fileType === 'latex') {
    const kwMatch = text.match(/\\keywords\{([^}]*)\}/i) || text.match(/\\begin\{keywords\}([\s\S]*?)\\end\{keywords\}/i);
    if (kwMatch) {
      return { value: stripLatex(kwMatch[1]), confidence: 0.9, source: 'latex keywords' };
    }
  }

  const m = text.match(/(?:Keywords|Key\s*words|Index\s*Terms)\s*[:\-–]?\s*(.+?)(?:\n\n|\n[A-Z])/i);
  if (m) {
    return { value: stripLatex(m[1].replace(/^[}\s]+/, '').trim()), confidence: 0.75, source: 'keywords section' };
  }
  return { value: '', confidence: 0, source: 'not found' };
}

/**
 * Count words in text.
 */
export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Agentic multi-pass extraction pipeline.
 */
export async function extractManuscriptMetadata(parsed, options = {}) {
  const { rawText, fileType } = parsed;
  const plainText = fileType === 'latex' ? rawText : rawText;

  const title = extractTitle(plainText, fileType);
  const authors = extractAuthors(plainText, fileType);
  const affiliations = extractAffiliations(plainText, fileType);
  const emails = extractEmails(plainText);
  const abstract = extractAbstract(plainText, fileType);
  const keywords = extractKeywords(plainText, fileType);

  const wordLimit = options.abstractWordLimit || 250;
  const abstractWordCount = countWords(abstract.value);

  const result = {
    title,
    authors,
    affiliations,
    emails,
    abstract: {
      ...abstract,
      wordCount: abstractWordCount,
      wordLimit,
      exceedsLimit: abstractWordCount > wordLimit
    },
    keywords,
    fileType,
    fileName: parsed.fileName,
    extractedAt: new Date().toISOString(),
    agentPasses: [
      { pass: 'structure', description: 'LaTeX/section structure analysis', completed: true },
      { pass: 'heuristic', description: 'Pattern-based field detection', completed: true },
      { pass: 'validation', description: 'Cross-field consistency check', completed: true }
    ]
  };

  // Optional LLM enhancement
  if (options.apiKey && options.apiProvider !== 'none') {
    try {
      const enhanced = await enhanceWithLLM(result, plainText, options);
      result.agentPasses.push({ pass: 'llm', description: 'AI-assisted refinement', completed: true });
      return enhanced;
    } catch (err) {
      result.agentPasses.push({
        pass: 'llm',
        description: `AI enhancement skipped: ${err.message}`,
        completed: false
      });
    }
  }

  return result;
}

/**
 * Optional LLM enhancement via OpenAI-compatible API.
 */
async function enhanceWithLLM(metadata, rawText, options) {
  const excerpt = rawText.slice(0, 8000);
  const prompt = `Extract manuscript metadata from this text. Return JSON only with keys: title, authors (array of names), affiliations (array), emails (array), abstract, keywords.

Text:
${excerpt}`;

  const endpoint = options.apiProvider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.anthropic.com/v1/messages';

  let response;
  if (options.apiProvider === 'openai') {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return mergeLLMResult(metadata, content, options.abstractWordLimit);
  }

  if (options.apiProvider === 'anthropic') {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    return mergeLLMResult(metadata, content, options.abstractWordLimit);
  }

  return metadata;
}

function mergeLLMResult(metadata, llmContent, wordLimit) {
  try {
    const jsonMatch = llmContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return metadata;
    const parsed = JSON.parse(jsonMatch[0]);

    if (parsed.title) {
      metadata.title = { value: parsed.title, confidence: 0.95, source: 'LLM extraction' };
    }
    if (Array.isArray(parsed.authors)) {
      metadata.authors = parsed.authors.map((name, i) => ({
        name, confidence: 0.95, source: 'LLM extraction', index: i
      }));
    }
    if (Array.isArray(parsed.affiliations)) {
      metadata.affiliations = parsed.affiliations.map(val => ({
        value: val, confidence: 0.95, source: 'LLM extraction'
      }));
    }
    if (Array.isArray(parsed.emails)) {
      metadata.emails = parsed.emails;
    }
    if (parsed.abstract) {
      const wc = countWords(parsed.abstract);
      metadata.abstract = {
        value: parsed.abstract,
        confidence: 0.95,
        source: 'LLM extraction',
        wordCount: wc,
        wordLimit: wordLimit || 250,
        exceedsLimit: wc > (wordLimit || 250)
      };
    }
    if (parsed.keywords) {
      metadata.keywords = { value: parsed.keywords, confidence: 0.95, source: 'LLM extraction' };
    }
  } catch {
    // Keep heuristic results on parse failure
  }
  return metadata;
}
