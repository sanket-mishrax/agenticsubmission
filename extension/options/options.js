import { getSettings, saveSettings } from '../lib/storage.js';

const wordLimit = document.getElementById('word-limit');
const apiProvider = document.getElementById('api-provider');
const apiKey = document.getElementById('api-key');
const autoFill = document.getElementById('auto-fill');
const saveBtn = document.getElementById('save-btn');
const saveStatus = document.getElementById('save-status');

async function load() {
  const settings = await getSettings();
  wordLimit.value = settings.abstractWordLimit;
  apiProvider.value = settings.apiProvider;
  apiKey.value = settings.apiKey;
  autoFill.checked = settings.autoFillEnabled;
}

saveBtn.addEventListener('click', async () => {
  await saveSettings({
    abstractWordLimit: parseInt(wordLimit.value, 10) || 250,
    apiProvider: apiProvider.value,
    apiKey: apiKey.value,
    autoFillEnabled: autoFill.checked
  });
  saveStatus.textContent = 'Settings saved!';
  setTimeout(() => { saveStatus.textContent = ''; }, 3000);
});

load();
