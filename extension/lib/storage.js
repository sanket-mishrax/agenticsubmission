/**
 * Cross-browser storage helpers for manuscript data and settings.
 */

import { browserAPI } from './browser-api.js';

const DEFAULT_SETTINGS = {
  apiProvider: 'none',
  apiKey: '',
  abstractWordLimit: 250,
  autoFillEnabled: true,
  preferredJournal: 'generic'
};

export async function getSettings() {
  const result = await browserAPI.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...result.settings };
}

export async function saveSettings(settings) {
  await browserAPI.storage.sync.set({ settings: { ...DEFAULT_SETTINGS, ...settings } });
}

export async function getManuscriptData() {
  const result = await browserAPI.storage.local.get('manuscriptData');
  return result.manuscriptData || null;
}

export async function saveManuscriptData(data) {
  await browserAPI.storage.local.set({ manuscriptData: data });
}

export async function clearManuscriptData() {
  await browserAPI.storage.local.remove('manuscriptData');
}
