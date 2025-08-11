// Discord Otomatik Çevirmen Background Script
chrome.runtime.onInstalled.addListener(() => {
  // Default settings
  chrome.storage.sync.set({
    isEnabled: true,
    targetLanguage: 'tr',
    sourceLanguage: 'auto'
  });
});

// Popup'tan gelen mesajları işle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(
      ['isEnabled', 'targetLanguage', 'sourceLanguage'],
      (result) => {
        sendResponse(result);
      }
    );
    return true; // Async response için
  }

  if (request.action === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      // Tüm Discord sekmelerine ayarları gönder
      chrome.tabs.query({ url: 'https://discord.com/*' }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: request.settings
          });
        });
      });
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'translate') {
    // Çeviri isteğini işle
    translateText(request.text, request.sourceLanguage, request.targetLanguage)
      .then((translatedText) => {
        sendResponse({ success: true, translatedText: translatedText });
      })
      .catch((error) => {
        console.error('Çeviri hatası:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Async response için
  }
});

// Çeviri fonksiyonu
async function translateText(text, sourceLanguage, targetLanguage) {
  try {
    // Google Translate API (unofficial endpoint)
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );

    if (response.ok) {
      const data = await response.json();
      let fullTranslation = '';
      if (data[0] && Array.isArray(data[0])) {
        data[0].forEach((part) => {
          if (part && part[0]) {
            fullTranslation += part[0];
          }
        });
      }
      const result = fullTranslation || data[0]?.[0]?.[0] || null;
      console.log('GOOGLE TRANSLATE API RESULT:', result);
      console.log('Original text:', text);
      return result;
    }
  } catch (error) {
    console.error('Google Translate API hatası:', error);
  }

  // Fallback: Her iki API de başarısız olursa
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
        text
      )}`
    );

    if (response.ok) {
      const data = await response.json();
      let fullTranslation = '';
      if (data[0] && Array.isArray(data[0])) {
        data[0].forEach((part) => {
          if (part && part[0]) {
            fullTranslation += part[0];
          }
        });
      }
      return fullTranslation || data[0]?.[0]?.[0] || null;
    }
  } catch (error) {
    console.error('Fallback çeviri API hatası:', error);
  }

  return null;
}

// Eklenti ikonuna tıklandığında popup'ı aç
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('discord.com')) {
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});
