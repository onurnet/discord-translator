// Discord Otomatik Çevirmen Content Script
class DiscordTranslator {
  constructor() {
    this.isEnabled = true;
    this.targetLanguage = 'en'; // English
    this.sourceLanguage = 'auto';
    this.translationAPI = 'libre'; // LibreTranslate default
    this.translatedMessages = new Set();
    this.observer = null;
    this.periodicCheckInterval = null;
    this.init();
  }

  async init() {
    // Ayarları storage'dan yükle
    const settings = await this.loadSettings();
    this.isEnabled = settings.isEnabled !== false;
    this.targetLanguage = settings.targetLanguage || 'tr';
    this.sourceLanguage = settings.sourceLanguage || 'auto';
    this.translationAPI = settings.translationAPI || 'libre';

    if (this.isEnabled) {
      this.startObserving();
    }
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(
        ['isEnabled', 'targetLanguage', 'sourceLanguage', 'translationAPI'],
        (result) => {
          resolve(result);
        }
      );
    });
  }

  startObserving() {
    // Discord mesajlarının bulunduğu container'ı izle
    const messageContainer =
      document.querySelector('[data-list-id="chat-messages"]') ||
      document.querySelector('[class*="messages"]') ||
      document.querySelector('[class*="chat"]');

    if (messageContainer) {
      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Sadece yeni eklenen mesajları işle
                const newMessages = node.querySelectorAll
                  ? node.querySelectorAll(
                      '[data-list-item-id*="chat-messages"]:not([data-translated]), [class*="message-"]:not([data-translated])'
                    )
                  : node.matches &&
                    (node.matches(
                      '[data-list-item-id*="chat-messages"]:not([data-translated])'
                    ) ||
                      node.matches(
                        '[class*="message-"]:not([data-translated])'
                      ))
                  ? [node]
                  : [];

                newMessages.forEach((message) => {
                  if (
                    !this.translatedMessages.has(message) &&
                    !message.hasAttribute('data-translated') &&
                    !message.querySelector(
                      'button[style*="background-color: #43b581"]'
                    ) &&
                    !message.querySelector(
                      'button[style*="background-color: #f04747"]'
                    )
                  ) {
                    this.translateMessage(message);
                  }
                });
              }
            });
          }
        });
      });

      this.observer.observe(messageContainer, {
        childList: true,
        subtree: true
      });

      // Mevcut mesajları işle - daha güçlü yaklaşım
      this.processExistingMessages();

      // Periyodik olarak yeni mesajları kontrol et
      this.startPeriodicCheck();
    } else {
      // Container henüz yüklenmemişse tekrar dene
      setTimeout(() => this.startObserving(), 1000);
    }
  }

  startPeriodicCheck() {
    // Her 10 saniyede bir yeni mesajları kontrol et
    this.periodicCheckInterval = setInterval(() => {
      // Sadece yeni mesajları kontrol et, mevcut çevirileri tekrar işleme
      const newMessages = document.querySelectorAll(
        '[data-list-item-id*="chat-messages"]:not([data-translated]), [class*="message-"]:not([data-translated])'
      );
      newMessages.forEach((message) => {
        if (
          !this.translatedMessages.has(message) &&
          !message.querySelector(
            'button[style*="background-color: #43b581"]'
          ) &&
          !message.querySelector('button[style*="background-color: #f04747"]')
        ) {
          this.translateMessage(message);
        }
      });
    }, 10000);
  }

  stopPeriodicCheck() {
    if (this.periodicCheckInterval) {
      clearInterval(this.periodicCheckInterval);
      this.periodicCheckInterval = null;
    }
  }

  processExistingMessages() {
    // Discord'un gerçek mesaj container'larını bul
    const messageContainers = document.querySelectorAll(
      '[data-list-item-id*="chat-messages"]'
    );

    if (messageContainers.length > 0) {
      messageContainers.forEach((container) => {
        // Daha güçlü kontrol - hem Set hem de attribute kontrolü
        if (
          !this.translatedMessages.has(container) &&
          !container.hasAttribute('data-translated') &&
          !container.querySelector(
            'button[style*="background-color: #43b581"]'
          ) &&
          !container.querySelector('button[style*="background-color: #f04747"]')
        ) {
          this.translateMessage(container);
        }
      });
      return;
    }

    // Alternatif: Discord'un mesaj yapısını hedefle
    const messages = document.querySelectorAll('[class*="message-"]');
    messages.forEach((message) => {
      // Daha güçlü kontrol
      if (
        !this.translatedMessages.has(message) &&
        !message.hasAttribute('data-translated') &&
        !message.querySelector('button[style*="background-color: #43b581"]') &&
        !message.querySelector('button[style*="background-color: #f04747"]')
      ) {
        this.translateMessage(message);
      }
    });
  }

  async translateMessage(messageElement) {
    try {
      // Sadece mesaj içeriğini bul - daha spesifik seçiciler
      const messageContent =
        messageElement.querySelector('[class*="messageContent"]') ||
        messageElement.querySelector('[class*="content"]') ||
        messageElement.querySelector('[class*="text"]');

      if (!messageContent) {
        return; // Mesaj içeriği bulunamadı
      }

      const originalText = messageContent.textContent.trim();

      // Çevrilmeyecek içerikleri filtrele
      if (this.shouldSkipTranslation(originalText)) {
        return;
      }

      if (
        originalText &&
        originalText.length > 10 &&
        originalText.length < 1000 &&
        !this.isAlreadyTranslated(messageContent)
      ) {
        // Çeviri yap
        const translatedText = await this.translateText(originalText);

        if (translatedText && translatedText !== originalText) {
          // Orijinal metni sakla ve çeviriyi göster
          this.showTranslation(messageContent, originalText, translatedText);
        }
      }

      // Mesaj container'ını da işaretle
      const messageContainer =
        messageElement.closest('[data-list-item-id*="chat-messages"]') ||
        messageElement.closest('[class*="message-"]');
      if (messageContainer) {
        messageContainer.setAttribute('data-translated', 'true');
      }
      this.translatedMessages.add(messageElement);
    } catch (error) {
      console.error('Çeviri hatası:', error);
    }
  }

  shouldSkipTranslation(text) {
    // Çevrilmeyecek içerikleri kontrol et
    const skipPatterns = [
      /^https?:\/\//, // URL'ler
      /^@\w+/, // Mention'lar
      /^\d+$/, // Sadece sayılar
      /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Sadece semboller
      /^(yesterday|today|tomorrow)/i, // Tarih ifadeleri
      /^\d{1,2}:\d{2}\s*(AM|PM)?$/i, // Saat formatları
      /^[🇹🇷🇺🇸🇬🇧🇩🇪🇫🇷🇪🇸🇮🇹🇷🇺🇯🇵🇰🇷🇨🇳]+$/, // Sadece bayraklar
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email adresleri
      /^[A-Za-z0-9._%+-]+\.[A-Za-z]{2,}$/, // Dosya uzantıları
      /^[A-Za-z0-9._%+-]+\s*\([0-9.]+\s*[KMB]B?\)$/, // Dosya boyutları
      /^[A-Za-z0-9._%+-]+\.[A-Za-z]{2,}\s*\([0-9.]+\s*[KMB]B?\)$/ // Dosya isimleri + boyut
    ];

    return skipPatterns.some((pattern) => pattern.test(text.trim()));
  }

  async translateText(text) {
    try {
      // Background script üzerinden çeviri isteği gönder
      const response = await chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        sourceLanguage: this.sourceLanguage,
        targetLanguage: this.targetLanguage,
        translationAPI: this.translationAPI
      });

      if (response && response.success) {
        return response.translatedText;
      }
    } catch (error) {
      console.error('Çeviri hatası:', error);
    }

    return null;
  }

  isAlreadyTranslated(element) {
    // Mesaj container'ını kontrol et
    const messageContainer =
      element.closest('[data-list-item-id*="chat-messages"]') ||
      element.closest('[class*="message-"]');

    if (messageContainer) {
      // Bu mesaj zaten çevrilmiş mi kontrol et
      return (
        messageContainer.hasAttribute('data-translated') ||
        messageContainer.querySelector(
          'button[style*="background-color: #43b581"]'
        ) !== null ||
        messageContainer.querySelector(
          'button[style*="background-color: #f04747"]'
        ) !== null ||
        messageContainer.querySelector('[style*="background: #2f3136"]') !==
          null
      );
    }

    return (
      element.hasAttribute('data-translated') ||
      element.querySelector('[data-translation]') !== null ||
      element.querySelector('button[style*="background-color: #43b581"]') !==
        null ||
      element.querySelector('button[style*="background-color: #f04747"]') !==
        null
    );
  }

  showTranslation(element, originalText, translatedText) {
    // Orijinal metni sakla
    element.setAttribute('data-original-text', originalText);
    element.setAttribute('data-translated', 'true');

    // Mesaj container'ını bul
    const messageContainer =
      element.closest('[data-list-item-id*="chat-messages"]') ||
      element.closest('[class*="message-"]') ||
      element.parentElement;

    if (!messageContainer) return;

    // Dil bayrakları ve isimleri
    const languageFlags = {
      tr: '🇹🇷',
      en: '🇺🇸',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
      it: '🇮🇹',
      ru: '🇷🇺',
      ja: '🇯🇵',
      ko: '🇰🇷',
      zh: '🇨🇳'
    };

    const languageNames = {
      tr: 'Turkish',
      en: 'English',
      de: 'German',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      ru: 'Russian',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese'
    };

    const flag = languageFlags[this.targetLanguage] || '🌐';
    const languageName = languageNames[this.targetLanguage] || 'Çeviri';

    // Çeviri butonunu oluştur
    const translationButton = document.createElement('button');
    translationButton.textContent = flag;
    translationButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      margin-left: 5px;
      padding: 2px 4px;
      border-radius: 3px;
      background-color: #5865f2;
      color: white;
    `;

    // Çeviri container'ını oluştur
    const translationContainer = document.createElement('div');
    translationContainer.style.cssText = `
      margin-top: 8px;
      padding: 8px 12px;
      background: #2f3136;
      border: 1px solid #40444b;
      border-radius: 4px;
      color: #dcddde;
      font-size: 14px;
      line-height: 1.4;
      max-width: 100%;
      word-wrap: break-word;
    `;

    // Çeviri içeriğini oluştur
    translationContainer.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: 600; color: #5865f2; font-size: 12px;">
        ${flag} ${languageName} Translation:
      </div>
      <div style="color: #ffffff;">
        ${translatedText}
      </div>
      <div style="margin-top: 8px; font-size: 10px; color: #72767d; border-top: 1px solid #40444b; padding-top: 5px;">
        <a href="https://signalboat.com" target="_blank" style="color: #5865f2; text-decoration: none;">
          🚢 SignalBoat.com
        </a>
      </div>
    `;

    // Çeviriyi mesajın hemen altına ekle
    const messageContent =
      element.closest('[class*="messageContent"]') || element;
    if (messageContent && messageContent.parentNode) {
      // Mesaj içeriğinin hemen altına çeviriyi ekle
      messageContent.parentNode.insertBefore(
        translationContainer,
        messageContent.nextSibling
      );
    } else {
      // Alternatif olarak mesaj container'ına ekle
      messageContainer.appendChild(translationContainer);
    }

    // Buton tıklama olayı - sadece gizleme için
    translationButton.addEventListener('click', (e) => {
      e.stopPropagation();

      if (translationContainer.parentNode) {
        translationContainer.remove();
        translationButton.style.backgroundColor = '#f04747'; // Kırmızı = gizli
      } else {
        // Çeviriyi tekrar göster
        const messageContent =
          element.closest('[class*="messageContent"]') || element;
        if (messageContent && messageContent.parentNode) {
          messageContent.parentNode.insertBefore(
            translationContainer,
            messageContent.nextSibling
          );
        } else {
          messageContainer.appendChild(translationContainer);
        }
        translationButton.style.backgroundColor = '#43b581'; // Yeşil = görünür
      }
    });

    // Butonu mesaja ekle ve yeşil yap (çeviri görünür)
    element.appendChild(translationButton);
    translationButton.style.backgroundColor = '#43b581';
  }

  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.stopPeriodicCheck();
  }

  updateSettings(newSettings) {
    Object.assign(this, newSettings);

    if (this.isEnabled) {
      this.startObserving();
    } else {
      this.stopObserving();
    }
  }
}

// Eklenti başlat
let translator = new DiscordTranslator();

// Background script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    translator.updateSettings(request.settings);
    sendResponse({ success: true });
  }
});
