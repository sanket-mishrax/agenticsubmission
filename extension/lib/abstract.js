/**
 * Abstract word-count utilities and shortening strategies.
 */

import { countWords } from './extractor.js';

/**
 * Split text into sentences.
 */
export function splitSentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Score sentence importance for trimming (higher = keep).
 */
function scoreSentence(sentence, index, total) {
  let score = 0;
  const lower = sentence.toLowerCase();

  // First and last sentences often carry key info
  if (index === 0) score += 3;
  if (index === total - 1) score += 2;

  // Research content signals
  const keepSignals = [
    'we present', 'we propose', 'we introduce', 'we demonstrate',
    'results show', 'findings', 'conclude', 'significant', 'novel',
    'method', 'approach', 'contribution', 'study', 'analysis'
  ];
  keepSignals.forEach(sig => {
    if (lower.includes(sig)) score += 2;
  });

  // Background/filler signals (lower priority)
  const trimSignals = [
    'in recent years', 'it is well known', 'has been widely',
    'plays an important role', 'in this paper we', 'the rest of'
  ];
  trimSignals.forEach(sig => {
    if (lower.includes(sig)) score -= 2;
  });

  // Prefer shorter sentences when trimming
  const words = countWords(sentence);
  if (words > 40) score -= 1;
  if (words < 15) score += 0.5;

  return score;
}

/**
 * Strategy 1: Remove lowest-scoring sentences until under limit.
 */
export function shortenBySentenceRemoval(text, wordLimit) {
  const sentences = splitSentences(text);
  if (sentences.length <= 1) return { text, removed: 0, strategy: 'sentence-removal' };

  const scored = sentences.map((s, i) => ({
    sentence: s,
    index: i,
    score: scoreSentence(s, i, sentences.length),
    words: countWords(s)
  }));

  // Always keep highest-scored sentences
  scored.sort((a, b) => b.score - a.score);

  const kept = [];
  let wordCount = 0;
  const keptIndices = new Set();

  for (const item of scored) {
    if (wordCount + item.words <= wordLimit || kept.length === 0) {
      kept.push(item);
      keptIndices.add(item.index);
      wordCount += item.words;
    }
    if (wordCount >= wordLimit * 0.85 && kept.length >= 2) break;
  }

  kept.sort((a, b) => a.index - b.index);
  const result = kept.map(k => k.sentence).join(' ');

  return {
    text: result,
    wordCount: countWords(result),
    removed: sentences.length - kept.length,
    strategy: 'sentence-removal',
    description: `Removed ${sentences.length - kept.length} lower-priority sentence(s)`
  };
}

/**
 * Strategy 2: Condense by removing filler phrases and redundant clauses.
 */
export function shortenByCondensing(text, wordLimit) {
  let condensed = text;

  const fillerPhrases = [
    /\bin this (?:paper|study|work|article),?\s*/gi,
    /\bit is (?:well known|widely accepted) that\s*/gi,
    /\bin recent years,?\s*/gi,
    /\bhas been (?:widely|extensively) (?:studied|investigated|explored)\s*/gi,
    /\bplays an? (?:important|crucial|significant) role in\s*/gi,
    /\bthe rest of (?:this|the) (?:paper|article) is organized as follows[.:]?\s*/gi,
    /\bwe note that\s*/gi,
    /\bit should be noted that\s*/gi,
    /\bmoreover,?\s*/gi,
    /\bfurthermore,?\s*/gi,
    /\badditionally,?\s*/gi,
    /\bin addition,?\s*/gi
  ];

  fillerPhrases.forEach(pattern => {
    condensed = condensed.replace(pattern, '');
  });

  condensed = condensed.replace(/\s+/g, ' ').trim();

  if (countWords(condensed) > wordLimit) {
    return shortenBySentenceRemoval(condensed, wordLimit);
  }

  return {
    text: condensed,
    wordCount: countWords(condensed),
    removed: countWords(text) - countWords(condensed),
    strategy: 'condense',
    description: 'Removed filler phrases and redundant wording'
  };
}

/**
 * Strategy 3: Extract first N words (last resort).
 */
export function shortenByTruncation(text, wordLimit) {
  const words = text.trim().split(/\s+/);
  const truncated = words.slice(0, wordLimit).join(' ');
  // Try to end at sentence boundary
  const lastPeriod = truncated.lastIndexOf('.');
  const final = lastPeriod > truncated.length * 0.7
    ? truncated.slice(0, lastPeriod + 1)
    : truncated + '...';

  return {
    text: final,
    wordCount: countWords(final),
    removed: words.length - countWords(final),
    strategy: 'truncation',
    description: 'Truncated to word limit (review carefully)'
  };
}

/**
 * Generate all shortening options for an abstract over the word limit.
 */
export function generateShorteningOptions(abstract, wordLimit = 250) {
  const currentCount = countWords(abstract);
  if (currentCount <= wordLimit) {
    return {
      needsShortening: false,
      currentCount,
      wordLimit,
      options: []
    };
  }

  const condense = shortenByCondensing(abstract, wordLimit);
  const sentenceRemoval = shortenBySentenceRemoval(abstract, wordLimit);
  const truncation = shortenByTruncation(abstract, wordLimit);

  const options = [
    {
      id: 'condense',
      label: 'Condense (remove filler)',
      ...condense,
      overLimit: condense.wordCount > wordLimit
    },
    {
      id: 'sentence-removal',
      label: 'Smart trim (remove sentences)',
      ...sentenceRemoval,
      overLimit: sentenceRemoval.wordCount > wordLimit
    },
    {
      id: 'truncation',
      label: 'Hard truncate',
      ...truncation,
      overLimit: false
    }
  ].filter(opt => opt.wordCount > 0);

  return {
    needsShortening: true,
    currentCount,
    wordLimit,
    overBy: currentCount - wordLimit,
    options
  };
}

/**
 * LLM-based abstract shortening (optional).
 */
export async function shortenWithLLM(abstract, wordLimit, options) {
  const prompt = `Shorten this academic abstract to at most ${wordLimit} words. Preserve key findings, methods, and conclusions. Return only the shortened abstract, no commentary.

Abstract (${countWords(abstract)} words):
${abstract}`;

  if (options.apiProvider === 'openai') {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || abstract;
    return {
      text,
      wordCount: countWords(text),
      strategy: 'llm',
      description: 'AI-generated concise abstract'
    };
  }

  if (options.apiProvider === 'anthropic') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.trim() || abstract;
    return {
      text,
      wordCount: countWords(text),
      strategy: 'llm',
      description: 'AI-generated concise abstract'
    };
  }

  throw new Error('No API provider configured for LLM shortening');
}
