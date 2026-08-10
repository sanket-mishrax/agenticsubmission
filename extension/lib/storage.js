/**
 * Chrome storage helpers for manuscript data and settings.
 */

const DEFAULT_SETTINGS = {
  apiProvider: 'none',
  apiKey: '',
  abstractWordLimit: 250,
  autoFillEnabled: true,
  preferredJournal: 'generic'
};

export async function getSettings() {
  const result = await chrome.storage.sync.get('settings');
  return { ...DEFAULT_SETTINGS, ...result.settings };
}

export async function saveSettings(settings) {
  await chrome.storage.sync.set({ settings: { ...DEFAULT_SETTINGS, ...settings } });
}

export async function getManuscriptData() {
  const result = await chrome.storage.local.get('manuscriptData');
  return result.manuscriptData || null;
}

export async function saveManuscriptData(data) {
  await chrome.storage.local.set({ manuscriptData: data });
}

export async function clearManuscriptData() {
  await chrome.storage.local.remove('manuscriptData');
}
