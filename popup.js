// Discord Çevirmen Popup Script
document.addEventListener('DOMContentLoaded', function () {
  const enabledCheckbox = document.getElementById('enabled');
  const targetLanguageSelect = document.getElementById('targetLanguage');
  const sourceLanguageSelect = document.getElementById('sourceLanguage');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  // Mevcut ayarları yükle
  loadSettings();

  // Event listeners
  enabledCheckbox.addEventListener('change', updateStatus);
  targetLanguageSelect.addEventListener('change', updateStatus);
  sourceLanguageSelect.addEventListener('change', updateStatus);
  saveButton.addEventListener('click', saveSettingsAndRefresh);

  function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
      if (settings) {
        enabledCheckbox.checked = settings.isEnabled !== false;
        targetLanguageSelect.value = settings.targetLanguage || 'tr';
        sourceLanguageSelect.value = settings.sourceLanguage || 'auto';
        updateStatus();
      }
    });
  }

  function saveSettings() {
    const settings = {
      isEnabled: enabledCheckbox.checked,
      targetLanguage: targetLanguageSelect.value,
      sourceLanguage: sourceLanguageSelect.value
    };

    chrome.runtime.sendMessage(
      {
        action: 'saveSettings',
        settings: settings
      },
      (response) => {
        if (response && response.success) {
          updateStatus();
        }
      }
    );
  }

  function saveSettingsAndRefresh() {
    saveSettings();

    // Discord sekmelerini yenile
    chrome.tabs.query({ url: 'https://discord.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id);
      });
    });

    // Popup'ı kapat
    window.close();
  }

  function updateStatus() {
    if (enabledCheckbox.checked) {
      statusDiv.textContent = '✅ Translation active';
      statusDiv.className = 'status enabled';
    } else {
      statusDiv.textContent = '❌ Translation disabled';
      statusDiv.className = 'status disabled';
    }
  }

  // İlk durumu güncelle
  updateStatus();
});
