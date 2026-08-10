/**
 * Shared background message handler for Chrome and Firefox.
 */

import { getManuscriptData, saveManuscriptData, getSettings } from '../lib/storage.js';
import { parseManuscriptFile } from '../lib/parser.js';
import { extractManuscriptMetadata } from '../lib/extractor.js';
import { generateShorteningOptions, shortenWithLLM } from '../lib/abstract.js';
import { formatLatexForJournal } from '../lib/latex-formatter.js';
import { browserAPI } from '../lib/browser-api.js';

export async function handleMessage(message) {
  switch (message.action) {
    case 'getManuscriptData': {
      const data = await getManuscriptData();
      return { data };
    }

    case 'parseAndExtract': {
      const settings = await getSettings();
      const parsed = await parseManuscriptFile(message.file);
      const metadata = await extractManuscriptMetadata(parsed, settings);
      await saveManuscriptData(metadata);

      if (metadata.abstract?.exceedsLimit) {
        metadata.shorteningOptions = generateShorteningOptions(
          metadata.abstract.value,
          settings.abstractWordLimit
        );
      }

      if (message.fileType === 'latex' || parsed.fileType === 'latex') {
        metadata.rawLatex = parsed.rawText;
      }

      await saveManuscriptData(metadata);
      return { data: metadata };
    }

    case 'applyShortening': {
      const data = await getManuscriptData();
      if (!data) throw new Error('No manuscript loaded');

      const settings = await getSettings();
      let newAbstract;

      if (message.strategy === 'llm') {
        newAbstract = await shortenWithLLM(
          data.abstract.value,
          settings.abstractWordLimit,
          settings
        );
      } else {
        const options = generateShorteningOptions(
          data.abstract.value,
          settings.abstractWordLimit
        );
        const chosen = options.options.find(o => o.id === message.strategy);
        if (!chosen) throw new Error('Unknown shortening strategy');
        newAbstract = chosen;
      }

      data.abstract.value = newAbstract.text;
      data.abstract.wordCount = newAbstract.wordCount;
      data.abstract.exceedsLimit = newAbstract.wordCount > settings.abstractWordLimit;
      data.abstract.shortenedBy = newAbstract.strategy;
      await saveManuscriptData(data);
      return { data, shortening: newAbstract };
    }

    case 'formatLatex': {
      const data = await getManuscriptData();
      if (!data?.rawLatex) throw new Error('No LaTeX source loaded. Upload a .tex file first.');
      const result = formatLatexForJournal(data.rawLatex, message.journalKey);
      data.formattedLatex = result;
      await saveManuscriptData(data);
      return { result };
    }

    case 'updateField': {
      const data = await getManuscriptData();
      if (!data) throw new Error('No manuscript loaded');
      const { field, value } = message;

      if (field === 'title') data.title = { ...data.title, value };
      else if (field === 'abstract') {
        const settings = await getSettings();
        const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
        data.abstract = {
          ...data.abstract,
          value,
          wordCount,
          exceedsLimit: wordCount > settings.abstractWordLimit
        };
      } else if (field === 'keywords') data.keywords = { ...data.keywords, value };
      else if (field === 'emails') data.emails = value;
      else if (field === 'authors') data.authors = value;
      else if (field === 'affiliations') data.affiliations = value;

      await saveManuscriptData(data);
      return { data };
    }

    case 'autofillPage': {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) throw new Error('No active tab found');
      await browserAPI.tabs.sendMessage(tab.id, { action: 'autofillNow' });
      return { ok: true };
    }

    case 'showPanel': {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];
      if (!tab?.id) throw new Error('No active tab found');
      await browserAPI.tabs.sendMessage(tab.id, { action: 'showAutofillPanel' });
      return { ok: true };
    }

    case 'getSettings': {
      return { settings: await getSettings() };
    }

    default:
      throw new Error(`Unknown action: ${message.action}`);
  }
}

export function registerMessageListener() {
  browserAPI.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch(err => {
      sendResponse({ error: err.message });
    });
    return true;
  });
}
